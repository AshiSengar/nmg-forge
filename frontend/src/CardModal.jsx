import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

const AVATAR_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#3b82f6', '#8b5cf6', '#06b6d4',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CardModal({ card, allTags, allMembers, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.due_date ? card.due_date.split('T')[0] : '');
  const [cardTags, setCardTags] = useState(card.tags || []);
  const [cardMembers, setCardMembers] = useState(card.members || []);
  const [activities, setActivities] = useState([]);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getActivities(card.id).then(setActivities).catch(() => {});
  }, [card.id]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateCard(card.id, { title, description, due_date: dueDate || null });
      onUpdate({ ...updated, tags: cardTags, members: cardMembers });
    } catch (e) {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = async (tag) => {
    const attached = cardTags.some(t => t.id === tag.id);
    try {
      if (attached) {
        await api.detachTag(card.id, tag.id);
        setCardTags(prev => prev.filter(t => t.id !== tag.id));
      } else {
        await api.attachTag(card.id, tag.id);
        setCardTags(prev => [...prev, tag]);
      }
    } catch (e) {
      setError('Failed to update tag.');
    }
  };

  const toggleMember = async (member) => {
    const assigned = cardMembers.some(m => m.id === member.id);
    try {
      if (assigned) {
        await api.unassignMember(card.id, member.id);
        setCardMembers(prev => prev.filter(m => m.id !== member.id));
      } else {
        await api.assignMember(card.id, member.id);
        setCardMembers(prev => [...prev, member]);
      }
    } catch (e) {
      setError('Failed to update member.');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const activity = await api.postComment(card.id, { content: comment });
      setActivities(prev => [activity, ...prev]);
      setComment('');
    } catch (e) {
      setError('Failed to post comment.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card permanently?')) return;
    try {
      await api.deleteCard(card.id);
      onDelete(card.id);
    } catch (e) {
      setError('Failed to delete card.');
    }
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date() && dueDate !== new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <input
            className="modal-title-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Card title"
            autoFocus
          />
          <button className="btn-close-modal" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-banner">{error}</div>}

          {/* Description */}
          <div>
            <div className="modal-section-title">📝 Description</div>
            <textarea
              className="modal-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div>
            <div className="modal-section-title">📅 Due Date {isOverdue && <span style={{color:'var(--danger)', marginLeft:8}}>⚠ OVERDUE</span>}</div>
            <input
              type="date"
              className="modal-date-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            {dueDate && <span style={{marginLeft:10, fontSize:12, color: isOverdue ? 'var(--danger)' : 'var(--text-muted)'}}>
              {formatDate(dueDate)}
            </span>}
          </div>

          {/* Tags */}
          <div>
            <div className="modal-section-title">🏷 Tags</div>
            <div className="tags-grid">
              {allTags.map(tag => {
                const active = cardTags.some(t => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    className={`tag-chip${active ? ' active' : ''}`}
                    style={{ background: tag.color }}
                    onClick={() => toggleTag(tag)}
                  >
                    <span className="tag-dot" />
                    {tag.name}
                    {active && ' ✓'}
                  </button>
                );
              })}
              {allTags.length === 0 && <span style={{color:'var(--muted)', fontSize:13}}>No tags created yet.</span>}
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="modal-section-title">👥 Members</div>
            <div className="members-list">
              {allMembers.map(member => {
                const active = cardMembers.some(m => m.id === member.id);
                return (
                  <div
                    key={member.id}
                    className={`member-row${active ? ' active' : ''}`}
                    onClick={() => toggleMember(member)}
                  >
                    <div className="member-row-avatar" style={{background: getAvatarColor(member.name)}}>
                      {initials(member.name)}
                    </div>
                    <div className="member-row-info">
                      <div className="member-row-name">{member.name}</div>
                      <div className="member-row-email">{member.email}</div>
                    </div>
                    <div className="member-check">✓</div>
                  </div>
                );
              })}
              {allMembers.length === 0 && <span style={{color:'var(--muted)', fontSize:13}}>No members created yet.</span>}
            </div>
          </div>

          {/* Activity */}
          <div>
            <div className="modal-section-title">💬 Activity</div>
            <div className="comment-form" style={{marginBottom:10}}>
              <textarea
                className="comment-input"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment…"
                rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(); }}
              />
              <button className="btn-comment" onClick={handleComment}>Post</button>
            </div>
            <div className="activity-list">
              {activities.map(act => (
                <div key={act.id} className="activity-item">
                  <div className="activity-avatar">
                    {act.member ? initials(act.member.name) : '⚡'}
                  </div>
                  <div className="activity-bubble">
                    <div className="activity-meta">
                      {act.member ? act.member.name : 'System'} · {formatDateTime(act.created_at)}
                      {act.type === 'move' && ' · moved'}
                    </div>
                    <div className="activity-content">{act.content}</div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div style={{color:'var(--muted)', fontSize:13, textAlign:'center', padding:'12px 0'}}>
                  No activity yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-delete" onClick={handleDelete}>
            🗑 Delete Card
          </button>
          <div style={{display:'flex', gap:8}}>
            <button className="btn-ghost" onClick={handleClose}>Cancel</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
