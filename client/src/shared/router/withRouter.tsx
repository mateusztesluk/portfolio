import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';


export const withRouter = (Component: React.ComponentType<any>) => {
  const ComponentWithRouterProp = (props: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const history = React.useMemo(() => ({
      push: (to: string) => navigate(to),
      replace: (to: string) => navigate(to, { replace: true }),
      goBack: () => navigate(-1),
    }), [navigate]);

    const match = React.useMemo(() => ({ params }), [params]);

    return (
      <Component
        {...props}
        history={history}
        location={location}
        match={match}
        navigate={navigate}
      />
    );
  };

  return ComponentWithRouterProp;
};
