import { BrowserRouter, HashRouter, Route, Routes } from 'react-router';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Talent from './pages/Talent.jsx';
import Companies from './pages/Companies.jsx';
import Process from './pages/Process.jsx';
import About from './pages/About.jsx';
import Resources from './pages/Resources.jsx';
import Article from './pages/Article.jsx';
import Contact from './pages/Contact.jsx';
import Join from './pages/Join.jsx';
import Privacy from './pages/Privacy.jsx';
import NotFound from './pages/NotFound.jsx';

// `__HASH_ROUTER__` is set by vite.config.js: the single-file preview build uses hash URLs
// (#/talent) so it works from any static viewer; the normal build uses clean URLs (/talent).
const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="talent" element={<Talent />} />
          <Route path="companies" element={<Companies />} />
          <Route path="process" element={<Process />} />
          <Route path="about" element={<About />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:slug" element={<Article />} />
          <Route path="contact" element={<Contact />} />
          <Route path="join" element={<Join />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
