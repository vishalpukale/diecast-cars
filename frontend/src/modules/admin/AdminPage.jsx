import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  adminCreateBrand,
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteBrand,
  adminDeleteCategory,
  adminDeleteProduct,
  adminGetBrands,
  adminGetCategories,
  adminGetOrders,
  adminGetProducts,
  adminUpdateBrand,
  adminUpdateCategory,
  adminUpdateOrderStatus,
  adminUpdateProduct,
  adminUploadImages,
} from '../../services/api';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../constants/orderStatus';
import { formatInr, slugify } from '../../utils/format';
import { resolveMediaUrl } from '../../utils/media';

const emptyProductForm = {
  name: '',
  sku: '',
  brandId: '',
  categoryId: '',
  price: '',
  stock: '10',
  scale: '1:64',
  shortDescription: '',
  description: '',
  isFeatured: false,
  isJustArrived: true,
  isActive: true,
};

const emptyBrandForm = { name: '', sortOrder: '0', isActive: true };
const emptyCategoryForm = { name: '', description: '', sortOrder: '0', isActive: true };

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'brands', label: 'Brands' },
  { id: 'categories', label: 'Categories' },
  { id: 'orders', label: 'Orders' },
];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('diecast_admin') === '1'
  );
  const [keyInput, setKeyInput] = useState('');
  const [tab, setTab] = useState('products');
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [brandForm, setBrandForm] = useState(emptyBrandForm);
  const [editingBrandId, setEditingBrandId] = useState(null);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const expectedKey = import.meta.env.VITE_ADMIN_API_KEY;

  const load = async () => {
    try {
      setLoading(true);
      const [productData, orderData, brandData, categoryData] = await Promise.all([
        adminGetProducts({ limit: 100 }),
        adminGetOrders(),
        adminGetBrands(),
        adminGetCategories(),
      ]);
      setProducts(productData.items || []);
      setOrders(orderData || []);
      setBrands(brandData || []);
      setCategories(categoryData || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  useEffect(() => {
    if (editingProductId || !brands.length) return;
    setProductForm((prev) => ({
      ...prev,
      brandId: prev.brandId || String(brands[0].id),
      categoryId: prev.categoryId || String(categories[0]?.id || ''),
    }));
  }, [brands, categories, editingProductId]);

  const unlock = (e) => {
    e.preventDefault();
    if (keyInput !== expectedKey) {
      toast.error('Invalid admin key');
      return;
    }
    sessionStorage.setItem('diecast_admin', '1');
    setUnlocked(true);
  };

  const resetProductForm = () => {
    setProductForm({
      ...emptyProductForm,
      brandId: brands[0] ? String(brands[0].id) : '',
      categoryId: categories[0] ? String(categories[0].id) : '',
    });
    setEditingProductId(null);
    setImages([]);
  };

  const startEditProduct = (p) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name || '',
      sku: p.sku || '',
      brandId: String(p.brandId),
      categoryId: String(p.categoryId),
      price: String(p.price),
      stock: String(p.stock),
      scale: p.scale || '1:64',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      isFeatured: !!p.isFeatured,
      isJustArrived: !!p.isJustArrived,
      isActive: p.isActive !== false,
    });
    setImages(
      (p.images || []).map((img) => ({
        url: img.url,
        alt: img.alt || p.name,
      }))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSelectImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast.error('Maximum 5 images per product');
      return;
    }

    try {
      setUploading(true);
      const result = await adminUploadImages(files.slice(0, remaining));
      setImages((prev) => [...prev, ...(result.images || [])].slice(0, 5));
      toast.success(`${result.images?.length || 0} image(s) uploaded`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSaveProduct = async (e) => {
    e.preventDefault();
    if (!images.length) {
      toast.error('Upload at least 1 diecast image (max 5)');
      return;
    }

    const payload = {
      brandId: Number(productForm.brandId),
      categoryId: Number(productForm.categoryId),
      sku: productForm.sku,
      name: productForm.name,
      slug: slugify(productForm.name),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      scale: productForm.scale,
      shortDescription: productForm.shortDescription,
      description: productForm.description,
      isFeatured: productForm.isFeatured,
      isJustArrived: productForm.isJustArrived,
      isActive: productForm.isActive,
      thumbnailUrl: images[0].url,
      images: images.map((img, index) => ({
        url: img.url,
        alt: productForm.name,
        sort: index,
      })),
    };

    try {
      if (editingProductId) {
        await adminUpdateProduct(editingProductId, payload);
        toast.success('Product updated');
      } else {
        await adminCreateProduct(payload);
        toast.success('Product created');
      }
      resetProductForm();
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDeleteProduct = async (id) => {
    if (!window.confirm('Soft-delete this product?')) return;
    try {
      await adminDeleteProduct(id);
      toast.success('Product deleted');
      if (editingProductId === id) resetProductForm();
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSaveBrand = async (e) => {
    e.preventDefault();
    const payload = {
      name: brandForm.name,
      sortOrder: Number(brandForm.sortOrder) || 0,
      isActive: brandForm.isActive,
    };
    try {
      if (editingBrandId) {
        await adminUpdateBrand(editingBrandId, payload);
        toast.success('Brand updated');
      } else {
        await adminCreateBrand(payload);
        toast.success('Brand created');
      }
      setBrandForm(emptyBrandForm);
      setEditingBrandId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDeleteBrand = async (id) => {
    if (!window.confirm('Delete this brand? Products using it may break.')) return;
    try {
      await adminDeleteBrand(id);
      toast.success('Brand deleted');
      if (editingBrandId === id) {
        setBrandForm(emptyBrandForm);
        setEditingBrandId(null);
      }
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSaveCategory = async (e) => {
    e.preventDefault();
    const payload = {
      name: categoryForm.name,
      description: categoryForm.description,
      sortOrder: Number(categoryForm.sortOrder) || 0,
      isActive: categoryForm.isActive,
    };
    try {
      if (editingCategoryId) {
        await adminUpdateCategory(editingCategoryId, payload);
        toast.success('Category updated');
      } else {
        await adminCreateCategory(payload);
        toast.success('Category created');
      }
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminDeleteCategory(id);
      toast.success('Category deleted');
      if (editingCategoryId === id) {
        setCategoryForm(emptyCategoryForm);
        setEditingCategoryId(null);
      }
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onOrderStatusChange = async (orderNumber, status) => {
    try {
      await adminUpdateOrderStatus(orderNumber, status);
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!unlocked) {
    return (
      <section className="container-shell py-16">
        <h1 className="font-display text-5xl tracking-[0.04em]">Seller admin</h1>
        <p className="muted mt-2 mb-6">
          Manage products, brands, categories, and order status.
        </p>
        <form onSubmit={unlock} className="max-w-md space-y-4">
          <div className="field">
            <label htmlFor="adminKey">Admin key</label>
            <input
              id="adminKey"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-dark">
            Unlock
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="container-shell py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-5xl tracking-[0.04em]">Seller admin</h1>
          <p className="muted mt-1">Full catalog & order management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`btn ${tab === t.id ? 'btn-dark' : 'btn-ghost'}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="muted mb-4">Refreshing…</p>}

      {tab === 'products' && (
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={onSaveProduct}
            className="grid gap-3 border border-[rgba(18,18,18,0.08)] bg-white/70 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-3xl tracking-[0.04em]">
                {editingProductId ? 'Edit product' : 'Add product'}
              </h2>
              {editingProductId && (
                <button type="button" className="btn btn-ghost text-sm" onClick={resetProductForm}>
                  Cancel edit
                </button>
              )}
            </div>

            <div className="field">
              <label>Name</label>
              <input
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>SKU (unique product code)</label>
              <input
                required
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label>Brand</label>
                <select
                  required
                  value={productForm.brandId}
                  onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Category</label>
                <select
                  required
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="field">
                <label>Price (₹)</label>
                <input
                  required
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Stock</label>
                <input
                  required
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Scale (e.g. 1:64)</label>
                <input
                  value={productForm.scale}
                  onChange={(e) => setProductForm({ ...productForm, scale: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Short description</label>
              <input
                value={productForm.shortDescription}
                onChange={(e) =>
                  setProductForm({ ...productForm, shortDescription: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Diecast images (max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading || images.length >= 5}
                onChange={onSelectImages}
              />
              <p className="muted mt-1 text-xs">
                {images.length}/5 uploaded. First image is the main thumbnail.
              </p>
            </div>

            {images.length > 0 && (
              <div className="upload-preview-grid">
                {images.map((img, index) => (
                  <div key={`${img.url}-${index}`} className="relative">
                    <img src={resolveMediaUrl(img.url)} alt={`Upload ${index + 1}`} />
                    <button
                      type="button"
                      className="absolute right-1 top-1 bg-black/70 px-1.5 text-xs text-white"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={productForm.isFeatured}
                onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={productForm.isJustArrived}
                onChange={(e) =>
                  setProductForm({ ...productForm, isJustArrived: e.target.checked })
                }
              />
              Just arrived
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
              />
              Active (visible on storefront)
            </label>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading
                ? 'Uploading…'
                : editingProductId
                  ? 'Save product'
                  : 'Create product'}
            </button>
          </form>

          <div className="overflow-x-auto border border-[rgba(18,18,18,0.08)] bg-white/70">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[rgba(18,18,18,0.08)] text-xs uppercase tracking-wide text-[rgba(18,18,18,0.5)]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Scale</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Active</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[rgba(18,18,18,0.06)]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveMediaUrl(p.thumbnailUrl)}
                          alt=""
                          className="h-12 w-12 object-cover"
                        />
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-[rgba(18,18,18,0.45)]">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{p.scale}</td>
                    <td className="p-3">{formatInr(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">{p.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="mr-3 font-semibold text-[var(--ink)]"
                        onClick={() => startEditProduct(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-[var(--signal)]"
                        onClick={() => onDeleteProduct(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'brands' && (
        <div className="grid gap-8 lg:grid-cols-[0.6fr_1fr]">
          <form
            onSubmit={onSaveBrand}
            className="grid gap-3 border border-[rgba(18,18,18,0.08)] bg-white/70 p-4"
          >
            <h2 className="font-display text-3xl tracking-[0.04em]">
              {editingBrandId ? 'Edit brand' : 'Add brand'}
            </h2>
            <div className="field">
              <label>Name</label>
              <input
                required
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Sort order</label>
              <input
                type="number"
                value={brandForm.sortOrder}
                onChange={(e) => setBrandForm({ ...brandForm, sortOrder: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={brandForm.isActive}
                onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingBrandId ? 'Save brand' : 'Create brand'}
              </button>
              {editingBrandId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setBrandForm(emptyBrandForm);
                    setEditingBrandId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto border border-[rgba(18,18,18,0.08)] bg-white/70">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-[rgba(18,18,18,0.5)]">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3">Active</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id} className="border-b border-[rgba(18,18,18,0.06)]">
                    <td className="p-3 font-semibold">{b.name}</td>
                    <td className="p-3 text-[rgba(18,18,18,0.5)]">{b.slug}</td>
                    <td className="p-3">{b.sortOrder}</td>
                    <td className="p-3">{b.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="mr-3 font-semibold"
                        onClick={() => {
                          setEditingBrandId(b.id);
                          setBrandForm({
                            name: b.name,
                            sortOrder: String(b.sortOrder ?? 0),
                            isActive: b.isActive !== false,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-[var(--signal)]"
                        onClick={() => onDeleteBrand(b.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="grid gap-8 lg:grid-cols-[0.6fr_1fr]">
          <form
            onSubmit={onSaveCategory}
            className="grid gap-3 border border-[rgba(18,18,18,0.08)] bg-white/70 p-4"
          >
            <h2 className="font-display text-3xl tracking-[0.04em]">
              {editingCategoryId ? 'Edit category' : 'Add category'}
            </h2>
            <div className="field">
              <label>Name</label>
              <input
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                rows={2}
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, description: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Sort order</label>
              <input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, sortOrder: e.target.value })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={categoryForm.isActive}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingCategoryId ? 'Save category' : 'Create category'}
              </button>
              {editingCategoryId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setCategoryForm(emptyCategoryForm);
                    setEditingCategoryId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto border border-[rgba(18,18,18,0.08)] bg-white/70">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-[rgba(18,18,18,0.5)]">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3">Active</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-[rgba(18,18,18,0.06)]">
                    <td className="p-3 font-semibold">{c.name}</td>
                    <td className="p-3 text-[rgba(18,18,18,0.5)]">{c.slug}</td>
                    <td className="p-3">{c.sortOrder}</td>
                    <td className="p-3">{c.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="mr-3 font-semibold"
                        onClick={() => {
                          setEditingCategoryId(c.id);
                          setCategoryForm({
                            name: c.name,
                            description: c.description || '',
                            sortOrder: String(c.sortOrder ?? 0),
                            isActive: c.isActive !== false,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-[var(--signal)]"
                        onClick={() => onDeleteCategory(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <p className="muted mb-4 text-sm">
            After checkout, orders start as <strong>Pending WhatsApp</strong>. Update status
            here once you confirm on WhatsApp (customers do not see this on the storefront).
          </p>
          <div className="overflow-x-auto border border-[rgba(18,18,18,0.08)] bg-white/70">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-[rgba(18,18,18,0.08)] text-xs uppercase tracking-wide text-[rgba(18,18,18,0.5)]">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[rgba(18,18,18,0.06)]">
                    <td className="p-3 font-semibold">{o.orderNumber}</td>
                    <td className="p-3">
                      <p>{o.customerName}</p>
                      <p className="text-xs text-[rgba(18,18,18,0.45)]">{o.customerPhone}</p>
                    </td>
                    <td className="p-3">
                      {o.city} {o.pincode}
                    </td>
                    <td className="p-3">{formatInr(o.total)}</td>
                    <td className="p-3">
                      <select
                        className="rounded border border-[rgba(18,18,18,0.15)] bg-white px-2 py-1 text-sm"
                        value={o.status}
                        onChange={(e) => onOrderStatusChange(o.orderNumber, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td className="p-4 muted" colSpan={5}>
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
