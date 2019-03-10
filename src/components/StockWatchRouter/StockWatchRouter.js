/**
 * @file
 * Entrypoint to the Stockwatch React App.
 */

import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  withRouter,
  Redirect,
} from 'react-router-dom'
import StockSearch from '../StockSearch/StockSearch';
import LoginForm from '../LoginForm/LoginForm';
import Dashboard from '../Dashboard/Dashboard';
import Home from '../HomePage/HomePage';
import './StockWatchRouter.scss';
import {appAuth} from '../AppAuth/AppAuth.js';

// See: https://tylermcginnis.com/react-router-protected-routes-authentication/
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    appAuth.isAuthenticated === true
      ? <Component {...props} />
      : <Redirect to={{
          pathname: "/log-in",
          state: { from: props.location }
        }} />
  )} />
);

const AuthButton = withRouter(({ history }) => (
  appAuth.isAuthenticated ? (
    <div className="logout navigation__link">
      <div className="logout__text">Log Out</div>
      <div className="logout__button">
        <button onClick={() => {
          appAuth.signout(() => history.push('/'))
        }}>Sign out</button>
      </div>
    </div>
  ) : (
    ''
  )
));

class StockWatchRouter extends React.Component {
  constructor(props) {
    super();

    this.state = {
      navigationLinks: [
        {
          path: '/',
          text: 'Home'
        },
        {
          path: '/dashboard',
          text: 'Dashboard'
        },
        {
          path: '/stock-search',
          text: 'Search'
        },
      ],
    }

    this.userAuth = this.userAuth.bind(this);
  }

  userAuth() {
    // Check for an Oauth access token and save to session storage.
    let url = window.location.href;
    let accessToken = url.match(/access_token/);

    if (accessToken) {
      function getParameterByName(name) {
        let match = RegExp('[#&]' + name + '=([^&]*)').exec(url);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
      }

      let oauthAccessToken = getParameterByName('access_token');
      sessionStorage.setItem('oauthAccessToken', oauthAccessToken);

      return true;
    }
    else return false;
  }

  render() {
    return (
      <React.Fragment>
        <Router>
          <div>
            <div className="navigation__container">
              <div className="navigation__container-inner container">
                <ul className="navigation__links">
                  {this.state.navigationLinks.map((link, key) => {
                    return <li
                    className="navigation__link"
                    key={key}>
                      <Link to={link.path}>{link.text}</Link>
                    </li>;
                  })}
                </ul>
                {/* Render Logout button */}
                <AuthButton />
              </div>
            </div>

            <Route
              exact path="/"
              render={(props) => <Home {...props} isLoggedIn={this.isLoggedIn} />}
            />
            <PrivateRoute path='/dashboard' component={Dashboard} />
            <PrivateRoute path='/stock-search' component={StockSearch} />
            <Route
              path="/log-in"
              render={(props) => <LoginForm {...props} updateAuthState={this.updateAuthState} auth={appAuth} />}
            />
          </div>
        </Router>
      </React.Fragment>
    );
  }
}

export default StockWatchRouter;