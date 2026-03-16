import React from 'react';
import { useLocation } from 'react-router-dom';

import './Authors.scss';

import { getConfigUrlSrvBlog } from 'config';
import { User } from 'shared/interfaces/user';
import SelectCardList from 'components/Blog/common/SelectCardList';


const Authors = () => {
  const location = useLocation();
  const authors = (location.state as { authors?: User[] } | null)?.authors;

  return (
    <SelectCardList
      endpoint={getConfigUrlSrvBlog('authors')}
      selector="username"
      filters={{ user_id: 'id' }}
      initData={authors}
    />
  );
};

export default Authors;