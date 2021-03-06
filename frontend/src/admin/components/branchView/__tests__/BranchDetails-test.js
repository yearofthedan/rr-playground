import React from 'react';
import { BranchDetails } from '../BranchDetails';
import { shallow } from 'enzyme';

describe('BranchDetails', () => {
  let rendered;
  const branch = {
    name: 'Branch name',
    contact: 'Contact details',
    notes: 'This branch is decent',
  };

  beforeEach(() => {
    rendered = shallow(<BranchDetails selectedBranch={branch} />);
  });

  it('renders the header with the branch name', () => {
    const heading = rendered.find('h3');
    expect(heading.text()).toContain('Branch name');
  });

  it('renders details with any contact and notes', () => {
    const details = rendered.find('dl');
    expect(details.text()).toContain('Contact details');
    expect(details.text()).toContain('This branch is decent');
  });
});
