import { Element, ElementType, Blog, BlogFormData } from 'shared/interfaces/blog';
import { getConfigUrlSrvBlog } from 'config';
import HttpService from './HttpService';
import FileService from './file.service';


class BlogService {
  _httpService: HttpService = new HttpService();
  _file: FileService = new FileService();
  seperator: string = '/{}/';
  separatorHelper: string = '//{()}\\';
  elementSeparator: string = '/{element}/';
  paragraphPrefix: string = 'paragraph:';
  imagePrefix: string = 'image';

  formatContent(elements: Element[]) {
    return elements
      .map((elem: Element) => (
        elem.type === ElementType.PARAGRAPH
          ? `${this.paragraphPrefix}${encodeURIComponent(String(elem.value))}`
          : this.imagePrefix
      ))
      .join(this.elementSeparator);
  }

  unformatContent(contentStr: string, filenamesStr: string | null) {
    const content: Element[] = [];
    const uuids = (filenamesStr && filenamesStr.split(',')) || [];

    if (contentStr?.includes(this.elementSeparator)) {
      let imageIndex = 0;

      contentStr.split(this.elementSeparator).forEach((part) => {
        if (part.startsWith(this.paragraphPrefix)) {
          const paragraph = part.slice(this.paragraphPrefix.length);
          content.push({
            value: decodeURIComponent(paragraph),
            type: ElementType.PARAGRAPH
          });
          return;
        }

        if (part === this.imagePrefix) {
          const uuid = uuids[imageIndex];
          imageIndex += 1;
          if (uuid) {
            content.push({ value: uuid, type: ElementType.IMAGE });
          }
        }
      });

      return content;
    }

    uuids.forEach(uuid => {
      contentStr = contentStr.replace(this.seperator, this.separatorHelper);
      const tmpContent = contentStr.split(this.separatorHelper);
      contentStr = tmpContent[1];
      if (tmpContent[0]) content.push({value: tmpContent[0], type: ElementType.PARAGRAPH});
      content.push({value: uuid, type: ElementType.IMAGE});
    });
    if (contentStr) content.push({value: contentStr, type: ElementType.PARAGRAPH});
    return content;
  }

  removeBlog(id: number) {
    const url = `${getConfigUrlSrvBlog('base')}${id}/`;
    return this._httpService.delete(url).then(response => response);
  }

  getBlog(id: number) {
    const url = `${getConfigUrlSrvBlog('base')}${id}/`;
    return this._httpService.get(url).then(response => ({...response, countries: response.countries.split(';')}));
  }

  putBlog(id: number, rawData: BlogFormData) {
    const data = this._formatBlogDataToSend(rawData);
    const url = `${getConfigUrlSrvBlog('base')}${id}/`;
    return this._httpService.put(url, data).then((response: Blog) => response);
  }

  activateBlog(id: number) {
    const url = `${getConfigUrlSrvBlog('base')}${id}/`;
    const data = {is_active: true};
    return this._httpService.put(url, data).then((response: Blog) => response);
  }

  getActivatedBlogs(params: {} = {}) {
    const url = getConfigUrlSrvBlog('base');
    const newParams = {...params, is_active: true};
    return this._httpService.get(url, newParams).then((response: Blog[]) => response);
  }

  getBlogs(params: {} = {}) {
    const url = getConfigUrlSrvBlog('base');
    return this._httpService.get(url, params).then((response: Blog[]) => response);
  }

  postBlog(rawData: BlogFormData) {
    const data = this._formatBlogDataToSend(rawData);
    const url = getConfigUrlSrvBlog('base');
    return this._httpService.post(url, data, {headers: {'Content-Type': 'multipart/form-data'}}).then((response: Blog) => response);
  }

  _formatBlogDataToSend(rawData: BlogFormData) {
    const data = new FormData();
    const images = rawData.elements.filter(el => el.type === ElementType.IMAGE);
    const existingImages = images
      .map(el => el.value)
      .filter((value): value is string => typeof value === 'string')
      .map((v) => this._file.toPhotoIdForApi(v))
      .filter(Boolean);
    const newImages = images
      .map(el => el.value)
      .filter((value): value is File => value instanceof File);

    newImages.forEach((image) => {
      data.append('file', image);
    });

    const formattedContent = this.formatContent(rawData.elements);
    data.set('content', formattedContent);
    data.set('photo_names', existingImages.join(','));
    data.set('countries', rawData.countries.join(';'));
    data.set('title', rawData.title);
    return data;
  }
}

export default BlogService;