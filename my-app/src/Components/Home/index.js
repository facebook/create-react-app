import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink } from 'reactstrap';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    return (
      <div>
        <Nav pills>
          <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle nav caret>
              Shooter Options
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Player Option</DropdownItem>
              <DropdownItem divider />
              <DropdownItem href = "/">Point Guard</DropdownItem>
              <DropdownItem>Shooting Guard</DropdownItem>
              <DropdownItem>Power Forward</DropdownItem>
              <DropdownItem>Center</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </div>
    );
  }
}