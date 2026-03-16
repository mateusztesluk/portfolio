import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';

import './Blog.scss';

import { BlogSidebar } from './Sidebar';
import { AuthGuard } from 'shared/guards/AuthGuard'
import AddForm  from './add/Add';
import Sites from './cards/Sites';
import Entry from './detail/Entry';
import Authors from './cards/Authors';
import Dashboard from './Dashboard';
import Account from './account/Account';
import Update from './update/Update';


interface Props {

}

const BlogComponent = (props: Props) => {
  const renderContent = () => {
    return (
      <Routes>
          <Route index element={<Dashboard />} />
          <Route path="authors" element={<Authors />} />
          <Route path="add" element={<AuthGuard component={AddForm} app="blog" />} />
          <Route path="edit/:id" element={<Update />} />
          <Route path="sites" element={<Sites />} />
          <Route path="profile" element={<Account />} />
          <Route path=":id" element={<Entry />} />
      </Routes>
    )
  }

  return (
    <BlogSidebar>
      {renderContent()}
    </BlogSidebar>
  )
}

export const Blog = connect(null)(BlogComponent);