import { AngularApplicationPage } from './app.po';

describe('angular-application App', () => {
  let page: AngularApplicationPage;

  beforeEach(() => {
    page = new AngularApplicationPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
