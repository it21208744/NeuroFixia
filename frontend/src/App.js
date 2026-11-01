import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav } from "context";
import { useAuth } from "context/AuthContext";
import ErrorBoundary from "components/ErrorBoundary";
import brand from "assets/images/neurofixia-logo.svg";

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/authentication/sign-in" replace state={{ from: location }} />;
  return children;
}
RequireAuth.propTypes = { children: PropTypes.node.isRequired };

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);
      if (!route.route) return null;
      const element = (
        <ErrorBoundary key={route.key}>
          {route.public ? route.component : <RequireAuth>{route.component}</RequireAuth>}
        </ErrorBoundary>
      );
      return <Route exact path={route.route} element={element} key={route.key} />;
    });

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && user && (
        <Sidenav
          color={sidenavColor}
          brand={brand}
          brandName="NeuroFixia"
          routes={routes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>
        {getRoutes(routes)}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/authentication/sign-in"} replace />}
        />
      </Routes>
    </ThemeProvider>
  );
}
