import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Layout from 'components/layout';
import { H1 } from 'components/style';
import withData from 'lib/with-data';
import { getUserPageData } from 'lib/rest-api';

const UserProps = styled.ul`
  display: block;
  max-width: 500px;
  margin: 0 auto;

  > li {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

class UserPage extends React.PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      username: PropTypes.string
    })
  };

  static async getInitialProps({ req }) {
    const data = await getUserPageData(req);
    return data;
  }

  render() {
    const { user } = this.props;

    return (
      <Layout {...this.props} title="User page">
        <H1>User page</H1>
        <UserProps>
          <li>
            <span>Name:</span>
            <span>{user.name}</span>
          </li>
          <li>
            <span>Phone:</span>
            <span>{user.phone}</span>
          </li>
          <li>
            <span>Email:</span>
            <span>{user.email}</span>
          </li>
          <li>
            <span>Username:</span>
            <span>{user.username}</span>
          </li>
        </UserProps>
      </Layout>
    );
  }
}

export default withData(UserPage);
