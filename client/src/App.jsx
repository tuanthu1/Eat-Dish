import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Auth from './pages/auth/Auth'; 
import RecipeDetailPage from './pages/RecipeDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound/NotFound';
import VerifyEmail from './pages/auth/VerifyEmail';
import AdminPage from './pages/Admin/AdminPage'; 
import PremiumSuccess from './pages/PremiumSuccess';
import ResetPassword from './pages/auth/ResetPassword';

import MaintenancePage from './pages/MaintenancePage'; 
import axiosClient from './api/axiosClient';

const AdminRoute = ({ user, isChecking, children }) => {
    if (isChecking) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>⏳ Đang tải dữ liệu...</div>;
    }
    if (!user || user.role !== 'admin') {
        return <Navigate to="/not-found" replace />; 
    }
    return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false); 
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true); 

  useEffect(() => {
    const userId = localStorage.getItem('eatdish_user_id');
    const userRole = localStorage.getItem('eatdish_user_role');
    const token = localStorage.getItem('token');

    if (userId && userRole && token) {
        setUser({ id: userId, role: userRole });
    } else {
        console.log("Không tìm thấy thông tin đăng nhập đầy đủ.");
    }
    setIsChecking(false);
    const checkMaintenanceStatus = async () => {
        try {
            const res = await axiosClient.get('/settings/maintenance');
            setIsMaintenance(res.data.isMaintenance);

        } catch (err) {
            console.error("Lỗi lấy trạng thái bảo trì:", err);
        } finally {
            setIsCheckingMaintenance(false);
        }
    };

    checkMaintenanceStatus();
  }, []);
  useEffect(() => {
    const enforceTrueIdentity = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axiosClient.get('/auth/me');
            const realUser = res.data.user;

            const fakeId = localStorage.getItem('eatdish_user_id');
            const fakeRole = localStorage.getItem('eatdish_user_role');

            if (String(realUser.id) !== String(fakeId) || realUser.role !== fakeRole) {
                console.warn("Phát hiện gian lận Local Storage! Đang khôi phục...");
                localStorage.setItem('eatdish_user_id', realUser.id);
                localStorage.setItem('eatdish_user_role', realUser.role);
                localStorage.setItem('user', JSON.stringify(realUser));
                window.location.reload(); 
            }
        } catch (error) {
            // Nếu Token bị lỗi, bị fake hoặc hết hạn -> Đá văng ra chuồng gà
            localStorage.clear();
            window.location.href = '/login-register?expired=true';
        }
    };

    enforceTrueIdentity();
}, []);
  if (isCheckingMaintenance) {
      return <div style={{textAlign: 'center', marginTop: '50px', fontSize: '20px'}}>🧑‍🍳 Đang chuẩn bị nhà bếp...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login-register" element={<Auth setUser={setUser} />} />
        {isMaintenance && user?.role !== 'admin' ? (
            <Route path="*" element={<MaintenancePage />} />
        ) : (
            <>
                <Route path="/premium-success" element={<PremiumSuccess />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="/" element={<HomePage user={user} />} />
                <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route 
                    path="/admin" 
                    element={
                        <AdminRoute user={user} isChecking={isChecking}>
                            <AdminPage />
                        </AdminRoute>
                    } 
                />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
            </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;