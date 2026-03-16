import React, { useState, useEffect } from 'react';

import { Blog } from 'shared/interfaces/blog';
import BlogService from 'shared/services/blog.service';

interface Props {

}

const _service: BlogService = new BlogService();

const Admin = (_props: Props) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    getMostSeenBlogs();
  }, []);

  const getMostSeenBlogs = () => {
    _service.getBlogs().then((response: Blog[]) => {
      setBlogs(response);
    }).catch(err => {});
  }

  const activateBlog = (id: number) => {
    _service.activateBlog(id).then(res => {
      getMostSeenBlogs();
    }).catch(err => {});
  }

  return (
    <div className="blog-admin">
      {blogs.map((blog: Blog, index: number) => {
        return <div key={index}>
          {blog.title}
          <span onClick={() => activateBlog(blog.id)}>Activate</span>
        </div>
      })}
    </div>
  );
};

export default Admin;