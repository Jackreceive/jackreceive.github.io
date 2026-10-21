import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import profileUrl from '../../data/profile.json?url';
import './styles.css';

const pages = ['home', 'research', 'life'];
const labels = {
  zh: {
    home: '首页', research: '项目与研究', life: '个人生活', navigation: '主导航',
    switchLanguage: 'Switch to English', language: 'English', skip: '跳转到正文',
    education: '教育背景', skills: '专业技能', awards: '获奖及证书', photoPlaceholder: '照片待添加',
    researchFocus: '研究方向', projects: '项目经历', details: '详细介绍', source: '源代码',
    lifeIntro: '在这里记录旅行见闻与日常生活。', lifeEmpty: '旅行记录整理中，之后会在这里更新。',
    updated: '最近更新', loading: '正在加载…', error: '暂时无法加载个人资料',
    errorHelp: '请稍后重试。', retry: '重新加载',
    description: '曾家琛的个人主页：西安电子科技大学电子信息硕士研究生，研究方向为医学影像。'
  },
  en: {
    home: 'Home', research: 'Research & Projects', life: 'Life', navigation: 'Main navigation',
    switchLanguage: '切换到中文', language: '中文', skip: 'Skip to content',
    education: 'Education', skills: 'Skills', awards: 'Awards & Certificates', photoPlaceholder: 'Photo to be added',
    researchFocus: 'Research', projects: 'Projects', details: 'Details', source: 'Source code',
    lifeIntro: 'Travel notes and moments from everyday life.', lifeEmpty: 'Travel stories are on the way. I’ll share them here.',
    updated: 'Last updated', loading: 'Loading…', error: 'Unable to load the profile',
    errorHelp: 'Please try again in a moment.', retry: 'Try again',
    description: 'Jiachen Zeng’s personal homepage. Master’s student in Electronic Information at Xidian University, researching medical imaging.'
  }
};

function readRoute() {
  const match = window.location.hash.match(/^#\/(zh|en)\/(home|research|life)$/);
  if (match) return { language: match[1], page: match[2] };
  let language = 'zh';
  try { if (localStorage.getItem('homepage-language') === 'en') language = 'en'; } catch { /* Storage is optional. */ }
  return { language, page: window.location.hash === '#projects' ? 'research' : 'home' };
}

function routeTo(language, page) {
  return `#/${language}/${page}`;
}

// Local photos follow the site directory, including GitHub project Pages.
function photoUrl(src) {
  return /^(https?:)?\/\//i.test(src) ? src : `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`;
}

function Home({ profile, shared, text, language }) {
  return <>
    <div className="profile-overview">
      <div className="profile-portrait">
        {shared.photo
          ? <img src={photoUrl(shared.photo)} alt={profile.name} />
          : <div className="photo-placeholder">{text.photoPlaceholder}</div>}
      </div>
      <div className="profile-information">
        <h1>{profile.name}</h1>
        <p className="identity">
          <span lang={language === 'zh' ? 'en' : 'zh-CN'}>{profile.alternateName}</span><br />
          {profile.role}<br />
          {profile.affiliation}<br />
          Email: <a href={`mailto:${shared.email}`}>{shared.email}</a><br />
          GitHub: <a href={shared.github}>Jackreceive</a>
        </p>
      </div>
    </div>
    {profile.intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

    <section>
      <h2>{text.education}</h2>
      <ul>{profile.education.map(item => <li key={item.id}>
        <strong>{item.title}</strong><br />
        {item.subtitle} <span className="period">· {item.period}</span>
        <p className="item-description">{item.description}</p>
      </li>)}</ul>
    </section>
    <section>
      <h2>{text.skills}</h2>
      <ul>{profile.skills.map(skill => <li key={skill.label}><strong>{skill.label}</strong>{language === 'zh' ? '：' : ': '}{skill.description}</li>)}</ul>
    </section>
    <section>
      <h2>{text.awards}</h2>
      <ul>{profile.awards.map(award => <li key={award.id}>{award.title} — {award.result}{award.date && ` (${award.date})`}</li>)}</ul>
    </section>
  </>;
}

function Research({ profile, text }) {
  return <>
    <h1>{text.research}</h1>
    <section><h2>{text.researchFocus}</h2><p>{profile.research}</p></section>
    <section>
      <h2>{text.projects}</h2>
      {profile.projects.map(project => <article className="project" key={project.id}>
        <h3><a href={project.url}>{project.title}</a></h3>
        <p>{project.description}</p>
        <p className="technologies">{project.technologies}</p>
        <details>
          <summary>{text.details}</summary>
          <ul>{project.details.map((paragraph, index) => <li key={index}>{paragraph}</li>)}</ul>
        </details>
        <a className="source-link" href={project.url}>{text.source}</a>
      </article>)}
    </section>
  </>;
}

function Life({ profile, text }) {
  return <>
    <h1>{text.life}</h1>
    <p>{text.lifeIntro}</p>
    {profile.lifeEntries.length === 0 ? <p className="muted">{text.lifeEmpty}</p> : profile.lifeEntries.map(entry => (
      <article className="life-entry" key={entry.id}>
        <h2>{entry.title}</h2>
        <p className="muted"><time dateTime={entry.date}>{entry.date}</time>{entry.location && ` · ${entry.location}`}</p>
        {entry.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        {(entry.photos || []).map(photo => <figure key={photo.src}>
          <img src={photoUrl(photo.src)} alt={photo.alt} loading="lazy" />
          {photo.caption && <figcaption>{photo.caption}</figcaption>}
        </figure>)}
      </article>
    ))}
  </>;
}

function App() {
  const [shared, setShared] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [route, setRoute] = useState(readRoute);
  const mainRef = useRef(null);
  const previousPage = useRef(route.page);
  const text = labels[route.language];
  const profile = shared?.locales[route.language];

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(profileUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Profile unavailable');
        return response.json();
      })
      .then(data => {
        if (!data.locales?.zh?.name || !data.locales?.en?.name) throw new Error('Invalid profile');
        setShared(data);
      })
      .catch(err => { if (err.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const syncRoute = () => setRoute(readRoute());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    document.documentElement.lang = route.language === 'zh' ? 'zh-CN' : 'en';
    document.title = `${profile?.name || (route.language === 'zh' ? '曾家琛' : 'Jiachen Zeng')} | ${text[route.page]}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', text.description);
    try { localStorage.setItem('homepage-language', route.language); } catch { /* The URL still preserves the language. */ }
    if (previousPage.current !== route.page) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
      previousPage.current = route.page;
    }
  }, [route, profile, text]);

  function switchLanguage() {
    window.location.hash = routeTo(route.language === 'zh' ? 'en' : 'zh', route.page);
  }

  return <div className="page">
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>{text.skip}</a>
    <header className="page-header">
      <nav aria-label={text.navigation}>{pages.map(page => <a key={page} href={routeTo(route.language, page)} aria-current={route.page === page ? 'page' : undefined}>{text[page]}</a>)}</nav>
      <button type="button" className="language-button" onClick={switchLanguage} aria-label={text.switchLanguage} lang={route.language === 'zh' ? 'en' : 'zh-CN'}>{text.language}</button>
    </header>
    <main id="main" ref={mainRef} tabIndex={-1}>
      {!profile ? <div role="status"><h1>{error ? text.error : text.loading}</h1>{error && <><p>{text.errorHelp}</p><button onClick={() => setAttempt(n => n + 1)}>{text.retry}</button></>}</div> : <>
        {route.page === 'home' && <Home profile={profile} shared={shared} text={text} language={route.language} />}
        {route.page === 'research' && <Research profile={profile} text={text} />}
        {route.page === 'life' && <Life profile={profile} text={text} />}
      </>}
    </main>
    {shared && <footer>{text.updated}: <time dateTime={shared.updated}>{shared.updated}</time></footer>}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
