import EmptyMini from "../components/EmptyMini";
import { formatCurrency } from "../lib/canteenData";

function AdminView({
  menuItems,
  draftItem,
  setDraftItem,
  onAddDraftItem,
  onToggleAvailability,
  onToggleArchive,
}) {
  const archivedItems = menuItems.filter((item) => item.archived);

  return (
    <div className="dashboard dashboard--admin">
      <section className="surface-card admin-menu-panel">
        <div className="panel-head">
          <h3>Live menu</h3>
        </div>
        <div className="admin-menu-list">
          {menuItems.map((item) => (
            <article key={item.id} className="admin-item">
              <div className="admin-item__top">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    <br />
                    {item.category} · {formatCurrency(item.price)}
                  </span>
                </div>
                <span
                  className={`pill pill--${item.available ? "success" : "muted"}`}
                >
                  {item.available ? "Live" : "Paused"}
                </span>
              </div>
              <div className="admin-item__actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onToggleAvailability(item.id)}
                >
                  {item.available ? "Mark unavailable" : "Mark available"}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onToggleArchive(item.id)}
                >
                  {item.archived ? "Restore" : "Archive"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card admin-side-panel">
        <div className="panel-head">
          <h3>Add special</h3>
        </div>
        <form className="admin-form" onSubmit={onAddDraftItem}>
          <label>
            <span>Item name</span>
            <input
              value={draftItem.name}
              onChange={(event) =>
                setDraftItem((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Cheese garlic maggi"
            />
          </label>
          <div className="admin-form__row">
            <label>
              <span>Category</span>
              <select
                value={draftItem.category}
                onChange={(event) =>
                  setDraftItem((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                <option>Rice</option>
                <option>Noodles</option>
                <option>Momos</option>
                <option>Sandwiches</option>
                <option>Quick Bites</option>
              </select>
            </label>
            <label>
              <span>Type</span>
              <select
                value={draftItem.kind}
                onChange={(event) =>
                  setDraftItem((current) => ({
                    ...current,
                    kind: event.target.value,
                  }))
                }
              >
                <option>Veg</option>
                <option>Non-Veg</option>
              </select>
            </label>
          </div>
          <label>
            <span>Price</span>
            <input
              type="number"
              min="1"
              max="200"
              value={draftItem.price}
              onChange={(event) =>
                setDraftItem((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows="3"
              value={draftItem.description}
              onChange={(event) =>
                setDraftItem((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Short kitchen note"
            />
          </label>
          <button type="submit" className="primary-button">
            Add item
          </button>
        </form>
        <div className="admin-archive">
          <h4>Archived</h4>
          {archivedItems.length === 0 ? (
            <EmptyMini text="No archived items." />
          ) : (
            <div className="archive-tags">
              {archivedItems.map((item) => (
                <span key={item.id} className="tag-chip">
                  {item.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminView;
