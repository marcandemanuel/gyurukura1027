import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import ScrollToTop from "./components/Common/ScrollToTop"
import DeviceGuard from "./components/Auth/DeviceGuard"
import AuthGuard from "./components/Auth/AuthGuard"
import ProfileSelect from "./pages/ProfileSelect/ProfileSelect"
import Home from "./pages/Home/Home"
import OrderDay from "./pages/OrderDay/OrderDay"
import MovieInfo from "./pages/MovieInfo/MovieInfo"
import DataTable from "./pages/DataTable/DataTable"
import ExpandedDataTable from "./pages/ExpandedDataTable/ExpandedDataTable";
import Countdown from "./pages/Countdown/Countdown"
import Options from "./pages/Options/Options"
import About from "./pages/About/About";
import ThankYou from "./pages/ThankYou/ThankYou"
import Seat from "./pages/Seat/Seat";
import NotFound from "./pages/NotFound/NotFound"
import ErrorBoundary from "./components/Common/ErrorBoundary.jsx";

function App() {
  return (
      <ErrorBoundary>
          <>
              <Layout>
                  <ScrollToTop />
                  <DeviceGuard>
                      <Routes>
                          <Route
                              path="/"
                              element={<Navigate to="/profilok" replace />}
                          />
                          <Route path="/profilok" element={<ProfileSelect />} />
                          <Route
                              path="/nasirend"
                              element={
                                  <AuthGuard>
                                      <Home />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/rendeles/:dayId"
                              element={
                                  <AuthGuard>
                                      <OrderDay />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/film/:movieId"
                              element={
                                  <AuthGuard>
                                      <MovieInfo />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/adatok"
                              element={
                                  <AuthGuard>
                                      <DataTable />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/adatok/:userId"
                              element={
                                  <AuthGuard>
                                      <ExpandedDataTable />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/koszonjuk"
                              element={
                                  <AuthGuard>
                                      <ThankYou />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/ulohely/:userId"
                              element={
                                  <AuthGuard>
                                      <Seat />
                                  </AuthGuard>
                              }
                          />
                          <Route
                              path="/visszaszamlalo"
                              element={<Countdown />}
                          />
                          <Route path="/nasiopciok" element={<Options />} />
                          <Route path="/gyurukura1027" element={<About />} />
                          <Route path="*" element={<NotFound />} />
                      </Routes>
                  </DeviceGuard>
              </Layout>
          </>
      </ErrorBoundary>
  );
}

export default App
