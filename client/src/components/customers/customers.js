/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import './customers.css';

class Customers extends Component {
  constructor() {
    super();
    this.state = {
      customers: [],
    };
  }

  componentDidMount() {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((customers) =>
        this.setState({ customers }, () => {
          console.log('customer fetched...', customers);
        })
      );
  }

  render() {
    const { customers } = this.state;
    return (
      <div>
        <h2>Customers</h2>
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>{customer.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Customers;
