import './App.css';
import Overview from "./Overview";
import Login from './Login';
import BranchSelector from "./Branch";
import About from "./About";
import StudentPerformance from "./StudentPerformance";
import SubjectWisePerformance from "./SubjectWisePerformance";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PageNotFound from './PageNotFound';
import { AuthProvider } from './AuthProvider';
import PrivateRoutes from './PrivateRoutes';
import Profile from './Profile';

function App() {


  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/branch" element={<PrivateRoutes />} >
              <Route index element={<BranchSelector />} />
              <Route path="overview" element={<Overview />} />
              <Route path="subject_wise_performance" element={<SubjectWisePerformance />} />
              <Route path="student_performance" element={<StudentPerformance />} />
              <Route path="about" element={<About />} />
              <Route path='profile' element={<Profile />} />
            </Route>

            <Route path="/" element={<Login />} />
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );


}
export default App;



