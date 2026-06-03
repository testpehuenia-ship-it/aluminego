'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  X,
  Save,
  Upload
} from 'lucide-react';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    link: '',
    image: ''
  });
  
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        link: category.link || '',
        image: category.image || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ title: '', link: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert('Error al subir imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCategories();
        closeModal();
      } else {
        alert('Error al guardar la categoría');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Categorías</h1>
          <p>Gestiona las categorías de comercios y servicios</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={20} /> Nueva Categoría
        </button>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredCategories.length} categorías</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Cargando categorías...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Link</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="category-img-thumb">
                        {category.image ? (
                          <img src={category.image} alt={category.title} />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td className="bold">{category.title}</td>
                    <td><code>{category.link || 'Sin link'}</code></td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" title="Editar" onClick={() => openModal(category)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" title="Eliminar" onClick={() => handleDelete(category.id)}>
                          <Trash2 size={16} />
                        </button>
                        {category.link && (
                          <a href={category.link} target="_blank" className="icon-btn view" title="Ver en web">
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Título de la Categoría</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Pizzería, Cabañas..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Enlace (URL relativa)</label>
                <input 
                  type="text" 
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="Ej: /comer#pizzería"
                />
              </div>
              <div className="form-group">
                <label>Imagen de la Categoría <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', marginLeft: '6px' }}>(Recomendado: 400x400px o 800x600px, Máx: 2MB)</span></label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    id="cat-image"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="cat-image" className="file-upload-label">
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                    {formData.image ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </label>
                </div>
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving || uploading}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        h1 { font-size: 1.875rem; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        p { color: #64748b; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .add-btn { background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { background: #0f766e; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2); }
        .content-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
        .toolbar { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-wrapper input { width: 100%; padding: 10px 10px 10px 42px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
        .search-wrapper input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }
        .count-badge { background: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .table-container { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 16px 24px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 16px 24px; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }
        .bold { font-weight: 600; color: #1e293b; }
        .category-img-thumb { width: 48px; height: 48px; border-radius: 10px; background: #f1f5f9; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .category-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #0d9488; }
        .actions-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; background: #f1f5f9; color: #64748b; }
        .icon-btn.edit:hover { background: #0d948815; color: #0d9488; }
        .icon-btn.delete:hover { background: #ef444415; color: #ef4444; }
        .icon-btn.view:hover { background: #06b6d415; color: #06b6d4; }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; width: 100%; max-width: 500px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalSlide 0.3s ease-out; }
        @keyframes modalSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 8px; transition: all 0.2s; }
        .close-btn:hover { background: #f1f5f9; color: #1e293b; }
        .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .form-group input { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; transition: all 0.2s; outline: none; }
        .form-group input:focus { border-color: #0d9488; box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1); }
        
        .file-upload-wrapper { display: flex; flex-direction: column; gap: 8px; }
        .file-upload-label { border: 2px dashed #e2e8f0; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .file-upload-label:hover { border-color: #0d9488; background: #f0fdfa; color: #0d9488; }
        .image-preview { width: 100%; height: 120px; border-radius: 12px; overflow: hidden; background: #f1f5f9; border: 1px solid #e2e8f0; }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        
        .modal-footer { margin-top: 12px; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel { padding: 12px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-save { padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .loading-state { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
