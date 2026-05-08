import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { MapPin, Stethoscope, CreditCard, CheckCircle, Loader, FileText, Trash2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import { useCart } from '../../context/CartContext'; 

// --- 2-HOUR INTERVAL TIME SLOTS ---
const ALL_TIME_SLOTS = [
  { label: "08:00 AM - 10:00 AM", startHour: 8 },
  { label: "10:00 AM - 12:00 PM", startHour: 10 },
  { label: "12:00 PM - 02:00 PM", startHour: 12 },
  { label: "02:00 PM - 04:00 PM", startHour: 14 },
  { label: "04:00 PM - 06:00 PM", startHour: 16 },
  { label: "06:00 PM - 08:00 PM", startHour: 18 },
];

const Booking = () => {
  const navigate = useNavigate();
  
  // <--- PULL DATA AND FUNCTIONS FROM CART --->
  const { cart, removeFromCart, clearCart } = useCart();
  
  // <--- CALCULATE GRAND TOTAL --->
  const totalAmount = cart.reduce((sum, test) => sum + test.price, 0);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [doctor, setDoctor] = useState('');
  const [collectionType, setCollectionType] = useState('Lab Visit');
  const [address, setAddress] = useState('');
  
  // Payment States
  const [paymentMode, setPaymentMode] = useState('Pay at Venue');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');

  // <--- NEW: STATE TO PRESERVE CART DETAILS FOR THE SUCCESS UI --->
  const [finalSummary, setFinalSummary] = useState({ items: [], total: 0 });

  // --- TIME SLOT LOGIC ---
  const isSlotDisabled = (startHour) => {
    if (!date) return false;

    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
                     String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');

    if (date !== todayStr) return false;
    return today.getHours() >= startHour;
  };

  useEffect(() => {
    if (time) {
      const selectedSlot = ALL_TIME_SLOTS.find(s => s.label === time);
      if (selectedSlot && isSlotDisabled(selectedSlot.startHour)) {
        setTime('');
      }
    }
  }, [date]);

  // <--- REDIRECT IF CART IS EMPTY (AND THEY HAVEN'T JUST BOOKED) --->
  useEffect(() => {
    if (cart.length === 0 && paymentStatus !== 'success') {
      navigate('/tests');
    }
  }, [cart, navigate, paymentStatus]);

  useEffect(() => {
    if (age && parseInt(age) < 55 && collectionType === 'Home Collection') {
      setCollectionType('Lab Visit');
      toast("Home Collection is only available for seniors (55+)", { icon: 'ℹ️' });
    }
  }, [age]);

  // --- PDF GENERATOR FUNCTION ---
  const downloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 255);
    doc.text("Dhandare Pathology Lab", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Appointment Confirmation Receipt", 20, 30);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.line(20, 45, 190, 45);
    doc.setFontSize(14);
    
    // Use finalSummary for PDF after cart is cleared
    const targetItems = paymentStatus === 'success' ? finalSummary.items : cart;
    const targetTotal = paymentStatus === 'success' ? finalSummary.total : totalAmount;

    const testNames = targetItems.map(t => t.name).join(', ');
    doc.text(`Tests Booked: ${testNames}`, 20, 60, { maxWidth: 170 }); 
    
    doc.text(`Patient Name: ${localStorage.getItem('userName') || 'Guest'}`, 20, 80);
    doc.text(`Appointment Date: ${date}`, 20, 90); 
    doc.text(`Appointment Time: ${time}`, 20, 100); 
    doc.text(`Payment Mode: ${paymentMode}`, 20, 110);
    doc.text(`Total Amount Paid: Rs. ${targetTotal}`, 20, 120);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Please arrive 10 minutes before your scheduled time.", 20, 140);
    doc.text("Thank you for choosing Dhandare Lab.", 20, 150);
    doc.save("DhandareLab_Receipt.pdf");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!time) {
      return toast.error("Please select a valid time slot");
    }
    
    if (collectionType === 'Home Collection' && !address) {
      return toast.error("Please enter your home address");
    }

    if (paymentMode === 'Pay Now') {
      setShowScannerModal(true); 
    } else {
      handleFinalBooking(); 
    }
  };

  const handleFinalBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login first");
      navigate('/login');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');
    
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const formData = new FormData();
      formData.append('testIds', JSON.stringify(cart.map(test => test._id)));
      formData.append('appointmentDate', date);
      formData.append('appointmentTime', time);
      formData.append('totalAmount', totalAmount);
      formData.append('patientAge', age);
      formData.append('patientPhone', phone);
      formData.append('collectionType', collectionType);
      formData.append('deliveryAddress', address);
      formData.append('doctorName', doctor);
      formData.append('paymentMethod', paymentMode);
      
      if (paymentMode === 'Pay Now') {
        formData.append('transactionId', transactionId);
        if (screenshot) {
          formData.append('paymentScreenshot', screenshot);
        }
      }

      await axios.post('http://localhost:5000/api/appointments/book', formData, config);
      
      // <--- SAVE CART DATA TO SUMMARY BEFORE CLEARING --->
      setFinalSummary({ items: [...cart], total: totalAmount });
      
      setPaymentStatus('success');
      toast.success('Booking Confirmed!');
      
      // <--- EMPTY THE CART UPON SUCCESS --->
      clearCart();
      
      if (paymentMode === 'Pay Now') {
        toast.success("Approval mail will be sent soon upon verification.");
      }

    } catch (error) {
      setPaymentStatus('idle');
      toast.error(error.response?.data?.message || 'Booking Failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && paymentStatus !== 'success') return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg border">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">Checkout</h2>
          
          {/* <--- UPDATED: SHOW SUMMARY IF SUCCESS, ELSE SHOW LIVE CART ---> */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-2 border-b border-blue-200 pb-2 flex justify-between">
              Selected Tests 
              <span className="text-sm font-normal text-blue-600">
                {paymentStatus === 'success' ? finalSummary.items.length : cart.length} item(s)
              </span>
            </h3>
            
            <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
              {(paymentStatus === 'success' ? finalSummary.items : cart).map((test) => (
                <div key={test._id} className="flex justify-between items-center py-2 border-b border-blue-100/50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{test.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">₹{test.price}</span>
                    {paymentStatus !== 'success' && (
                        <button 
                        type="button" 
                        onClick={() => removeFromCart(test._id)} 
                        className="text-red-400 hover:text-red-600 transition"
                        title="Remove Test"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 mt-2 border-t border-blue-200">
              <span className="font-bold text-gray-800 uppercase tracking-wide">Grand Total</span>
              <span className="text-2xl font-bold text-primary">
                ₹{paymentStatus === 'success' ? finalSummary.total : totalAmount}
              </span>
            </div>
          </div>

          {/* Success Message & Download Button */}
          {paymentStatus === 'success' ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg flex flex-col items-center">
                <CheckCircle className="w-12 h-12 mb-2 text-green-600" />
                <h3 className="text-xl font-bold">Booking Scheduled!</h3>
                <p>
                  {paymentMode === 'Pay Now' 
                    ? "Your payment is under review. Approval mail will be sent soon." 
                    : "Your appointment has been scheduled successfully."}
                </p>
              </div>
              
              <button 
                onClick={downloadReceipt}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> Download Receipt (PDF)
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/patient')}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Row 1: Age & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Age</label>
                    <input type="number" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={age} onChange={(e) => setAge(e.target.value)}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={phone} onChange={(e) => setPhone(e.target.value)}/>
                </div>
              </div>
              
              {/* Row 2: Doctor & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor (Optional)</label>
                    <input type="text" className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={doctor} onChange={(e) => setDoctor(e.target.value)}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" required className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
                </div>
              </div>
              
              {/* Row 3: Matrix Time Slots */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
                  {!date ? (
                    <div className="p-4 text-sm text-center text-gray-500 bg-gray-50 border border-dashed rounded">
                      Please select a Date first to view available slots.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_TIME_SLOTS.map((slot) => {
                        const disabled = isSlotDisabled(slot.startHour);
                        const selected = time === slot.label;
                        
                        return (
                          <button
                            type="button"
                            key={slot.startHour}
                            disabled={disabled}
                            onClick={() => setTime(slot.label)}
                            className={`p-2 text-xs font-semibold rounded border transition-all ${
                              disabled 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' 
                                : selected 
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* Home/Lab Toggle */}
              <div className="flex gap-4">
                  <button type="button" onClick={() => setCollectionType('Lab Visit')} className={`flex-1 py-2 rounded font-semibold border transition ${collectionType === 'Lab Visit' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>Lab Visit</button>
                  <button type="button" disabled={!age || parseInt(age) < 55} onClick={() => setCollectionType('Home Collection')} className={`flex-1 py-2 rounded font-semibold border transition ${collectionType === 'Home Collection' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}>Home Collection</button>
              </div>
              
              {collectionType === 'Home Collection' && (
                <textarea required className="w-full p-3 border rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter your full home address for sample collection" value={address} onChange={(e) => setAddress(e.target.value)}/>
              )}

              {/* PAYMENT BUTTONS */}
              {loading ? (
                <div className="w-full bg-gray-700 text-white py-3 rounded-lg font-bold text-lg shadow-md mt-6 flex justify-center items-center gap-2 cursor-not-allowed">
                  <Loader className="animate-spin w-5 h-5" /> Processing...
                </div>
              ) : (
                <div className="flex gap-4 mt-6">
                  <button 
                    type="submit" 
                    onClick={() => setPaymentMode('Pay at Venue')}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-bold"
                  >
                    🏥 Pay at Venue
                  </button>

                  <button 
                    type="submit"
                    onClick={() => setPaymentMode('Pay Now')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md"
                  >
                    📱 Pay Now (UPI)
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* --- UPI PAYMENT MODAL --- */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-96 max-w-full relative">
            <button 
              onClick={() => setShowScannerModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center mb-2 text-blue-600">Scan to Pay</h2>
            <p className="text-sm text-center text-gray-500 mb-6">Grand Total: <strong className="text-lg">₹{totalAmount}</strong></p>

            <div className="flex justify-center mb-6">
              <img 
              src="/payment-qr.jpeg"
              alt="UPI QR Code" 
              className="w-48 h-48 border-4 border-blue-100 rounded-lg shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">UPI Transaction ID *</label>
                <input 
                  type="text" 
                  placeholder="e.g., 31234567890" 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Screenshot *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  className="w-full border p-2 rounded text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <button 
                onClick={() => {
                  if(!transactionId || !screenshot) {
                    alert("Please enter Transaction ID and upload screenshot!");
                    return;
                  }
                  setShowScannerModal(false);
                  handleFinalBooking(); 
                }}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-bold mt-2 shadow-md"
              >
                Verify & Book Tests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;