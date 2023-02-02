import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import { AuthRoute, AuthRouteProps } from '../authRoute.component';
import { render } from '../../../../../tests/utils/rendering';
import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';

const mockDispatch = jest.fn();
jest.mock('../../../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  ...jest.requireActual<NodeModule>('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('AuthRoute: Component', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  const defaultProps: AuthRouteProps = {};

  const Component = (props: Partial<AuthRouteProps>) => (
    <Routes>
      <Route path="/" element={<AuthRoute {...defaultProps} {...props} />}>
        <Route index element={<span data-testid="content" />} />
      </Route>
      <Route path="/en/auth/login" element={<span data-testid="login-content" />} />
      <Route path="/en/404" element={<span data-testid="404-content" />} />
    </Routes>
  );

  describe('user profile is fetched', () => {
    describe('no allowedRoles prop is specified', () => {
      it('should render content', async () => {
        const apolloMocks = [
          fillCommonQueryWithUser(
            undefined,
            currentUserFactory({
              roles: [Role.ADMIN],
            })
          ),
        ];
        render(<Component />, { apolloMocks });
        expect(await screen.findByTestId('content')).toBeInTheDocument();
      });
    });

    describe('user has required role', () => {
      it('should render content', async () => {
        const apolloMocks = [
          fillCommonQueryWithUser(
            undefined,
            currentUserFactory({
              roles: [Role.ADMIN],
            })
          ),
        ];
        render(<Component allowedRoles={Role.ADMIN} />, { apolloMocks });
        expect(await screen.findByTestId('content')).toBeInTheDocument();
      });
    });

    describe('user doesnt have required role', () => {
      it('should redirect to not found page', async () => {
        const apolloMocks = [
          fillCommonQueryWithUser(
            undefined,
            currentUserFactory({
              roles: [Role.USER],
            })
          ),
        ];
        render(<Component allowedRoles={Role.ADMIN} />, { apolloMocks });
        expect(await screen.findByTestId('404-content')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      });
    });

    describe('user is not logged in', () => {
      it('should redirect to login page', async () => {
        render(<Component allowedRoles={Role.ADMIN} />);
        expect(await screen.findByTestId('login-content')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      });
    });
  });
});