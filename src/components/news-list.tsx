'use client';
import { useEffect, useState } from 'react';
import type { News } from '@/lib/content/types';
import { NewsCard } from './content';

export default function NewsList({ news }: { news: News[] }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const [topic, setTopic] = useState('All');
  const topics = [...new Set(news.flatMap((n) => n.categories || []))];
  useEffect(() => {
    const reveal = () => {
      const hash = window.location.hash.slice(1);
      const index = hash.startsWith('story-')
        ? news.findIndex((n) => `story-${n.id}` === hash)
        : /^news-update-\d+$/.test(hash)
          ? Number(hash.slice(12)) - 1
          : -1;
      if (index < 0 || index >= news.length) return;
      setQuery('');
      setTopic('All');
      setLimit((count) => Math.max(count, index + 1));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const target = document.getElementById(hash);
          const story = target
            ?.closest('.news-card')
            ?.querySelector<HTMLDetailsElement>('.news-story');
          if (story) story.open = true;
          target?.scrollIntoView();
        }),
      );
    };
    const frame = requestAnimationFrame(reveal);
    window.addEventListener('hashchange', reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', reveal);
    };
  }, [news]);
  const filtered = news.filter(
    (n) =>
      (topic === 'All' || n.categories?.includes(topic)) &&
      `${n.title} ${n.summary || ''}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const visible = filtered.slice(0, limit);
  return (
    <>
      <div className="filter-bar">
        <label htmlFor="news-search">Find a lab update</label>
        <input
          id="news-search"
          type="search"
          value={query}
          placeholder="Search news and milestones"
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(12);
          }}
        />
        {topics.length > 0 && (
          <label className="news-topic-filter">
            Topic
            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setLimit(12);
              }}
            >
              <option>All</option>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        )}
        <span role="status">
          {filtered.length} {filtered.length === 1 ? 'update' : 'updates'}
          {filtered.length > visible.length
            ? ` · showing ${visible.length}`
            : ''}
        </span>
      </div>
      <div className="news-list news-blog-grid">
        {visible.map((n) => (
          <NewsCard
            key={n.id}
            news={n}
            index={news.indexOf(n)}
            headingLevel={2}
          />
        ))}
      </div>
      {!filtered.length && (
        <p className="empty-state">
          No group updates match these filters.{' '}
          <button
            className="text-link"
            onClick={() => {
              setQuery('');
              setTopic('All');
            }}
          >
            Clear filters
          </button>
        </p>
      )}
      {visible.length < filtered.length && (
        <button
          className="button button-dark news-load-more"
          onClick={() => setLimit((count) => count + 12)}
        >
          Show more updates <span aria-hidden="true">↓</span>
        </button>
      )}
    </>
  );
}
