import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { getConfigUrlSrvBlog } from 'config';
import SelectCardList from 'components/Blog/common/SelectCardList';

const SitesComponent = () => {
  const location = useLocation();
  const sites = (location.state as { countries?: string[] } | null)?.countries;

  return (
    <SelectCardList endpoint={getConfigUrlSrvBlog('countries')} filters={{ countries: null }} initData={sites}></SelectCardList>
  );
};

export default connect()(SitesComponent);
