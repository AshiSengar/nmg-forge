import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import CardModal from './CardModal';

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

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDue(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function App() {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [board, setBoard] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({});
  const [openNewCardList, setOpenNewCardList] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');
  const [dragCard, setDragCard] = useState(null);
  const [dragOverList, setDragOverList] = useState(null);

  // Load boards and global data
  useEffect(() => {
    Promise.all([api.getBoards(), api.getTags(), api.getMembers()])
      .then(([b, t, m]) => {
        setBoards(b);
        setAllTags(t);
        setAllMembers(m);
        if (b.length > 0) setActiveBoardId(b[0].id);
        setLoading(false);
      })
      .catch(() => {
        setError('Cannot connect to the backend. Make sure Laravel is running on port 8000.');
        setLoading(false);
      });
  }, []);

  // Load active board
  useEffect(() => {
    if (!activeBoardId) { setBoard(null); return; }
    setBoard(null);
    api.getBoard(activeBoardId)
      .then(b => setBoard(b))
      .catch(() => setError('Failed to load board.'));
  }, [activeBoardId]);

  // Computed stats
  const stats = (() => {
    if (!board) return { lists: 0, cards: 0, assigned: 0, overdue: 0 };
    const cards = board.lists?.flatMap(l => l.cards) || [];
    return {
      lists: board.lists?.length || 0,
      cards: cards.length,
      assigned: cards.filter(c => c.members?.length > 0).length,
      overdue: cards.filter(c => isOverdue(c.due_date)).length,
    };
  })();

  // Board actions
  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    try {
      const b = await api.createBoard({ name: newBoardName });
      setBoards(prev => [...prev, b]);
      setActiveBoardId(b.id);
      setNewBoardName('');
      setShowNewBoard(false);
    } catch { setError('Failed to create board.'); }
  };

  const deleteBoard = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this board and all its data?')) return;
    try {
      await api.deleteBoard(id);
      const next = boards.filter(b => b.id !== id);
      setBoards(next);
      setActiveBoardId(next[0]?.id || null);
    } catch { setError('Failed to delete board.'); }
  };

  // List actions
  const addList = async () => {
    if (!newListName.trim() || !activeBoardId) return;
    try {
      const list = await api.createList(activeBoardId, { name: newListName });
      setBoard(prev => ({ ...prev, lists: [...(prev.lists || []), { ...list, cards: [] }] }));
      setNewListName('');
    } catch { setError('Failed to create list.'); }
  };

  const startEditList = (list) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const saveListName = async (listId) => {
    if (!editingListName.trim()) { setEditingListId(null); return; }
    try {
      const updated = await api.updateList(listId, { name: editingListName });
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => l.id === listId ? { ...l, name: updated.name } : l),
      }));
    } catch { setError('Failed to rename list.'); }
    setEditingListId(null);
  };

  const deleteList = async (listId) => {
    if (!confirm('Delete this list and all its cards?')) return;
    try {
      await api.deleteList(listId);
      setBoard(prev => ({ ...prev, lists: prev.lists.filter(l => l.id !== listId) }));
    } catch { setError('Failed to delete list.'); }
  };

  // Card actions
  const addCard = async (listId) => {
    const title = (newCardTitles[listId] || '').trim();
    if (!title) return;
    try {
      const card = await api.createCard(listId, { title });
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l =>
          l.id === listId ? { ...l, cards: [...l.cards, card] } : l
        ),
      }));
      setNewCardTitles(prev => ({ ...prev, [listId]: '' }));
      setOpenNewCardList(null);
    } catch { setError('Failed to create card.'); }
  };

  const updateCardInBoard = (updatedCard) => {
    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => ({
        ...l,
        cards: l.cards.map(c => c.id === updatedCard.id ? updatedCard : c),
      })),
    }));
    if (selectedCard?.id === updatedCard.id) setSelectedCard(updatedCard);
  };

  const deleteCardFromBoard = (cardId) => {
    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => ({
        ...l,
        cards: l.cards.filter(c => c.id !== cardId),
      })),
    }));
    setSelectedCard(null);
  };

  // Drag and Drop
  const handleDragStart = (e, card, listId) => {
    setDragCard({ card, listId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, listId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverList(listId);
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    setDragOverList(null);
    if (!dragCard || dragCard.listId === targetListId) { setDragCard(null); return; }
    const { card } = dragCard;
    // Optimistic update
    setBoard(prev => {
      const lists = prev.lists.map(l => {
        if (l.id === card.list_id || l.id === dragCard.listId) {
          return { ...l, cards: l.cards.filter(c => c.id !== card.id) };
        }
        if (l.id === targetListId) {
          return { ...l, cards: [...l.cards, { ...card, list_id: targetListId }] };
        }
        return l;
      });
      return { ...prev, lists };
    });
    try {
      await api.moveCard(card.id, targetListId);
    } catch { setError('Failed to move card.'); }
    setDragCard(null);
  };

  const handleDragEnd = () => {
    setDragCard(null);
    setDragOverList(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading NMG Forge…
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <div className="brand-name">NMG <span>Forge</span></div>
        </div>
        <div className="topbar-divider" />
        <div className="board-tabs">
          {boards.map(b => (
            <button
              key={b.id}
              className={`board-tab${activeBoardId === b.id ? ' active' : ''}`}
              onClick={() => setActiveBoardId(b.id)}
            >
              {b.name}
              <button className="delete-board-btn" onClick={(e) => deleteBoard(b.id, e)} title="Delete board">✕</button>
            </button>
          ))}
        </div>
        <button className="btn-new-board" onClick={() => setShowNewBoard(true)}>
          + New Board
        </button>
      </header>

      {/* Board Summary Bar */}
      {board && (
        <div className="board-summary">
          <div className="summary-stat">
            <span className="value">{stats.lists}</span>
            <span>Lists</span>
          </div>
          <div className="summary-stat">
            <span className="value">{stats.cards}</span>
            <span>Cards</span>
          </div>
          <div className="summary-stat assigned">
            <span className="value">{stats.assigned}</span>
            <span>Assigned</span>
          </div>
          <div className="summary-stat overdue">
            <span className="value">{stats.overdue}</span>
            <span>Overdue</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner" style={{margin:'10px 20px'}}>
          {error}
          <button onClick={() => setError('')} style={{marginLeft:12, cursor:'pointer', background:'none', border:'none', color:'inherit'}}>✕</button>
        </div>
      )}

      {/* Board Canvas */}
      {!board && !loading && boards.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:48}}>⚡</div>
          <h2>Welcome to NMG Forge</h2>
          <p>Create your first board to start organizing your Forge sprint with Hermes and OpenClaw.</p>
          <button className="btn-primary" onClick={() => setShowNewBoard(true)}>Create Your First Board</button>
        </div>
      ) : board ? (
        <div className="board-canvas">
          {board.lists?.map(list => (
            <div
              key={list.id}
              className={`list-col${dragOverList === list.id ? ' drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              {/* List Header */}
              <div className="list-header">
                {editingListId === list.id ? (
                  <input
                    className="list-name-input"
                    value={editingListName}
                    onChange={e => setEditingListName(e.target.value)}
                    onBlur={() => saveListName(list.id)}
                    onKeyDown={e => { if (e.key === 'Enter') saveListName(list.id); if (e.key === 'Escape') setEditingListId(null); }}
                    autoFocus
                  />
                ) : (
                  <span className="list-name" onDoubleClick={() => startEditList(list)} title="Double-click to rename">
                    {list.name}
                  </span>
                )}
                <span className="list-count">{list.cards?.length || 0}</span>
                <button className="btn-delete-list" onClick={() => deleteList(list.id)} title="Delete list">✕</button>
              </div>

              {/* Cards */}
              <div className="cards-list">
                {list.cards?.map(card => {
                  const overdue = isOverdue(card.due_date);
                  const isDragging = dragCard?.card?.id === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`card${overdue ? ' overdue' : ''}${isDragging ? ' dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, list.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedCard({ ...card, list_id: list.id })}
                    >
                      {card.tags?.length > 0 && (
                        <div className="card-tags">
                          {card.tags.map(tag => (
                            <div
                              key={tag.id}
                              className="card-tag"
                              style={{ background: tag.color }}
                              title={tag.name}
                            />
                          ))}
                        </div>
                      )}
                      <div className="card-title">{card.title}</div>
                      <div className="card-meta">
                        {card.due_date && (
                          <span className={`card-due${overdue ? ' overdue' : ''}`}>
                            {overdue ? '⚠' : '📅'} {formatDue(card.due_date)}
                          </span>
                        )}
                        {card.members?.length > 0 && (
                          <div className="card-members">
                            {card.members.slice(0, 3).map(m => (
                              <div
                                key={m.id}
                                className="member-avatar"
                                style={{ background: getAvatarColor(m.name) }}
                                title={m.name}
                              >
                                {initials(m.name)}
                              </div>
                            ))}
                            {card.members.length > 3 && (
                              <div className="member-avatar" style={{background:'var(--muted)'}}>
                                +{card.members.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* New Card */}
              <div className="new-card-area">
                {openNewCardList === list.id ? (
                  <>
                    <input
                      className="new-card-input"
                      placeholder="Card title…"
                      value={newCardTitles[list.id] || ''}
                      onChange={e => setNewCardTitles(prev => ({ ...prev, [list.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') addCard(list.id);
                        if (e.key === 'Escape') setOpenNewCardList(null);
                      }}
                      autoFocus
                    />
                    <div className="new-card-actions">
                      <button className="btn-add-card" onClick={() => addCard(list.id)}>Add Card</button>
                      <button className="btn-cancel-card" onClick={() => setOpenNewCardList(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <button className="btn-open-new-card" onClick={() => setOpenNewCardList(list.id)}>
                    + Add a card
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add List Column */}
          <div className="add-list-col">
            <input
              className="add-list-input"
              placeholder="List name…"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addList(); }}
            />
            <button className="btn-add-list" onClick={addList}>+ Add List</button>
          </div>
        </div>
      ) : (
        <div className="loading">
          <div className="spinner" />
          Loading board…
        </div>
      )}

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          allTags={allTags}
          allMembers={allMembers}
          onClose={() => setSelectedCard(null)}
          onUpdate={updateCardInBoard}
          onDelete={deleteCardFromBoard}
        />
      )}

      {/* New Board Dialog */}
      {showNewBoard && (
        <div className="new-board-modal" onClick={(e) => e.target === e.currentTarget && setShowNewBoard(false)}>
          <div className="new-board-dialog">
            <h2>⚡ Create New Board</h2>
            <input
              className="dialog-input"
              placeholder="Board name (e.g. Forge Sprint 2)"
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createBoard(); if (e.key === 'Escape') setShowNewBoard(false); }}
              autoFocus
            />
            <div className="dialog-actions">
              <button className="btn-ghost" onClick={() => setShowNewBoard(false)}>Cancel</button>
              <button className="btn-primary" onClick={createBoard}>Create Board</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
