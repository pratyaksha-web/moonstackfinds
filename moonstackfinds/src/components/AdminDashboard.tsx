import React, { useState, useEffect } from 'react';
import { 
  Lock, Settings, Plus, Edit, Trash2, Check, Sparkles, BookOpen, 
  ExternalLink, Eye, AlertCircle, ShoppingBag, Grid, RefreshCw, Star, Info,
  Upload, Copy, Search, Image as ImageIcon, BarChart2, Tag, Calendar, Sliders
} from 'lucide-react';
import { Product, Category, BlogPost, Subcategory } from '../types';
import { firebaseService, uploadImage } from '../lib/firebaseService';
import { db, auth } from '../firebase';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { getSlug } from '../lib/utils';

interface AdminDashboardProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  subcategories?: Subcategory[]; // make optional or standard
  setSubcategories?: React.Dispatch<React.SetStateAction<Subcategory[]>>;
  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  onLogout: () => void;
}

const PRESET_IMAGES = [
  { name: 'Warm Lit Desk Cozy', url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=600' },
  { name: 'Reading Nook with Tea', url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600' },
  { name: 'French Linen Bedding', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600' },
  { name: 'Cream Cable Knit Style', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600' },
  { name: 'Scintillating Soy Candle', url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600' },
  { name: 'Ceramic Tableware Sage', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600' },
  { name: 'Organic Squalane Skincare', url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600' }
];

export default function AdminDashboard({
  products,
  setProducts,
  categories,
  setCategories,
  subcategories = [],
  setSubcategories = () => {},
  blogs,
  setBlogs,
  onLogout
}: AdminDashboardProps) {
  // 7 Standard sections
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'subcategories' | 'blogs' | 'media' | 'settings'>('dashboard');

  // Firestore & Firebase Connection Diagnostics States
  const [firestoreError, setFirestoreError] = useState<{
    code: string;
    message: string;
    collection: string;
    documentData?: any;
  } | null>(null);

  const [dbVerification, setDbVerification] = useState<{
    isChecked: boolean;
    firebaseInitialized: boolean;
    firestoreConnected: boolean;
    productsCollectionExists: boolean;
    productsCount: number;
    error: string | null;
  }>({
    isChecked: false,
    firebaseInitialized: false,
    firestoreConnected: false,
    productsCollectionExists: false,
    productsCount: 0,
    error: null
  });

  // Verify Firebase & Firestore database on administrative load
  useEffect(() => {
    async function runVerification() {
      try {
        // 1. Check if Firebase is initialized correctly
        const hasProjectId = !!db?.app?.options?.projectId;
        const firebaseOk = hasProjectId;

        // 2. See if we can query the 'products' collection (connected check & existence check)
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        
        setDbVerification({
          isChecked: true,
          firebaseInitialized: firebaseOk,
          firestoreConnected: true,
          productsCollectionExists: true,
          productsCount: snapshot.size,
          error: null
        });
        console.log(`[Firestore Connection Verification Service SUCCESS] connected successfully. Products count: ${snapshot.size}`);
      } catch (err: any) {
        console.error("[Firestore Connection Verification Service FAILED]", err);
        setDbVerification({
          isChecked: true,
          firebaseInitialized: !!db?.app?.options?.projectId,
          firestoreConnected: false,
          productsCollectionExists: false,
          productsCount: 0,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    runVerification();
  }, [products]);

  // Enforce writing auth checks for workly244@gmail.com
  const validateAuthBeforeWrite = (collectionName: string, data?: any) => {
    const user = auth.currentUser;
    if (!user || !user.email || user.email.toLowerCase() !== 'workly244@gmail.com') {
      const errMsg = `Security Guard: Write operation in collection '${collectionName}' blocked. Authenticated user must be 'workly244@gmail.com'. Current: ${user ? user.email : 'Unauthenticated'}`;
      const mockErr = {
        code: 'auth/permission-denied',
        message: errMsg,
        collection: collectionName,
        documentData: data
      };
      setFirestoreError(mockErr);
      console.error('[Admin Auth Enforcement Error]', mockErr);
      alert(`Unauthorized Action:\n\n${errMsg}`);
      throw new Error(errMsg);
    }
  };

  // Media items state
  const [mediaItems, setMediaItems] = useState<{ id: string; name: string; url: string; createdAt: string; category?: string }[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // New Media Library States for categories, preview, and image replacement
  const [selectedMediaCategoryFilter, setSelectedMediaCategoryFilter] = useState<'All' | 'Books' | 'Fashion' | 'Home Decor' | 'Beauty' | 'Tech' | 'Uncategorized'>('All');
  const [pendingMediaFile, setPendingMediaFile] = useState<File | null>(null);
  const [pendingMediaPreview, setPendingMediaPreview] = useState<string | null>(null);
  const [pendingMediaName, setPendingMediaName] = useState<string>('');
  const [pendingMediaCategory, setPendingMediaCategory] = useState<'Books' | 'Fashion' | 'Home Decor' | 'Beauty' | 'Tech'>('Books');

  // Reuse selector modal
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState<boolean>(false);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<'product' | 'category' | 'blog' | null>(null);
  const [mediaSelectorSearch, setMediaSelectorSearch] = useState('');
  const [mediaSelectorCategoryFilter, setMediaSelectorCategoryFilter] = useState<'All' | 'Books' | 'Fashion' | 'Home Decor' | 'Beauty' | 'Tech' | 'Uncategorized'>('All');

  // Loading indicator for image uploads in forms
  const [isUploadingFormImage, setIsUploadingFormImage] = useState(false);

  // Product CRUD state
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    id: '', title: '', category: '', subcategory: '', description: '', 
    review: '', rating: 4.5, image: '', affiliateLink: '', featured: false, trending: false, tags: []
  });
  const [productTagsInput, setProductTagsInput] = useState('');

  // Category CRUD state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    id: '', name: '', description: '', image: '', icon: 'Sparkles'
  });

  // Subcategory CRUD state
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  const [subcategoryForm, setSubcategoryForm] = useState<Partial<Subcategory>>({
    id: '', categoryId: '', name: ''
  });

  // Blog CRUD state
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({
    id: '', title: '', excerpt: '', content: '', image: '', category: '', tags: [], productIds: [], images: [], affiliateLinks: [], pinterestImages: []
  });
  const [blogTagsInput, setBlogTagsInput] = useState('');
  const [blogProdIdsInput, setBlogProdIdsInput] = useState('');
  const [blogImagesInput, setBlogImagesInput] = useState('');
  const [blogAffiliatesInput, setBlogAffiliatesInput] = useState('');
  const [blogPinterestInput, setBlogPinterestInput] = useState('');

  // General settings state
  const [siteName, setSiteName] = useState('MoonStackFinds');
  const [allowGuestPins, setAllowGuestPins] = useState(true);

  // Universal feedback notice
  const [feedback, setFeedback] = useState('');

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  // Fetch Media Items from Firestore
  useEffect(() => {
    async function fetchMedia() {
      try {
        const snapshot = await getDocs(collection(db, 'media'));
        const items: any[] = [];
        snapshot.forEach(doc => {
          items.push(doc.data());
        });
        setMediaItems(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch (e) {
        console.error('Error fetching media:', e);
      }
    }
    fetchMedia();
  }, [activeTab]);

  // Set default category in product form when categories change
  useEffect(() => {
    if (categories.length > 0 && !productForm.category) {
      setProductForm(prev => ({ ...prev, category: categories[0].id }));
    }
    if (categories.length > 0 && !blogForm.category) {
      setBlogForm(prev => ({ ...prev, category: categories[0].id }));
    }
    if (categories.length > 0 && !subcategoryForm.categoryId) {
      setSubcategoryForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  // Dynamic subcategories list matching chosen parent category
  const activeProductCategory = productForm.category || (categories[0]?.id || '');
  const filteredSubcategories = subcategories.filter(sub => sub.categoryId === activeProductCategory);

  // Handle direct file upload for Product, Category, Blog forms
  const handleFormImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'category' | 'blog') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFormImage(true);
    try {
      const url = await uploadImage(file, target);
      
      // Auto-categorize based on form and category selections
      let categoryVal: 'Books' | 'Fashion' | 'Home Decor' | 'Beauty' | 'Tech' | 'Uncategorized' = 'Uncategorized';
      if (target === 'product') {
        const prodCatSlug = productForm.category?.toLowerCase() || '';
        if (prodCatSlug.includes('books')) categoryVal = 'Books';
        else if (prodCatSlug.includes('fashion')) categoryVal = 'Fashion';
        else if (prodCatSlug.includes('decor') || prodCatSlug.includes('home')) categoryVal = 'Home Decor';
        else if (prodCatSlug.includes('beauty')) categoryVal = 'Beauty';
        else if (prodCatSlug.includes('tech')) categoryVal = 'Tech';
      } else if (target === 'blog') {
        const blogCat = blogForm.category || '';
        if (blogCat.toLowerCase().includes('books')) categoryVal = 'Books';
        else if (blogCat.toLowerCase().includes('fashion')) categoryVal = 'Fashion';
        else if (blogCat.toLowerCase().includes('decor') || blogCat.toLowerCase().includes('home')) categoryVal = 'Home Decor';
        else if (blogCat.toLowerCase().includes('beauty')) categoryVal = 'Beauty';
        else if (blogCat.toLowerCase().includes('tech')) categoryVal = 'Tech';
      }

      // Auto-register inside the Media Library
      const mediaDoc = {
        id: `media-${Date.now()}`,
        name: file.name,
        url,
        category: categoryVal,
        createdAt: new Date().toISOString()
      };
      validateAuthBeforeWrite('media', mediaDoc);
      await setDoc(doc(db, 'media', mediaDoc.id), mediaDoc);
      setMediaItems(prev => [mediaDoc, ...prev]);

      // Assign to form
      if (target === 'product') {
        setProductForm(prev => ({ ...prev, image: url }));
      } else if (target === 'category') {
        setCategoryForm(prev => ({ ...prev, image: url }));
      } else if (target === 'blog') {
        setBlogForm(prev => ({ ...prev, image: url }));
      }
      triggerFeedback('Image uploaded successfully and registered in Media Library!');
    } catch (error) {
      console.error(error);
      triggerFeedback('Image upload failed.');
    } finally {
      setIsUploadingFormImage(false);
    }
  };

  // Preview chosen device image before actual publishing
  const handleSelectPendingMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingMediaFile(file);
    setPendingMediaName(file.name);

    // FileReader to generate instant local base64 preview
    const reader = new FileReader();
    reader.onload = () => {
      setPendingMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    triggerFeedback('Loaded file preview! Pick category and name of media to publish.');
  };

  // Publish/upload the pending media file to Firebase Storage & save to Firestore
  const handlePublishPendingMedia = async () => {
    if (!pendingMediaFile) return;

    setIsUploadingMedia(true);
    try {
      const url = await uploadImage(pendingMediaFile, 'media_library');
      const mediaDoc = {
        id: `media-${Date.now()}`,
        name: pendingMediaName || pendingMediaFile.name,
        url,
        category: pendingMediaCategory,
        createdAt: new Date().toISOString()
      };
      validateAuthBeforeWrite('media', mediaDoc);
      await setDoc(doc(db, 'media', mediaDoc.id), mediaDoc);
      setMediaItems(prev => [mediaDoc, ...prev]);
      
      // Reset pending states
      setPendingMediaFile(null);
      setPendingMediaPreview(null);
      setPendingMediaName('');
      
      triggerFeedback('Image successfully uploaded and registered in Media Library!');
    } catch (e) {
      console.error(e);
      triggerFeedback('Media upload failed.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Cancel/reset pending media before publishing
  const handleCancelPendingMedia = () => {
    setPendingMediaFile(null);
    setPendingMediaPreview(null);
    setPendingMediaName('');
    triggerFeedback('Media upload cancelled.');
  };

  // Replace existing media item image by uploading a new one and updating url/name/timestamp
  const handleReplaceMediaImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const url = await uploadImage(file, 'media_library');
      const existingItem = mediaItems.find(m => m.id === id);
      if (!existingItem) return;

      const updatedDoc = {
        ...existingItem,
        name: file.name,
        url,
        createdAt: new Date().toISOString()
      };
      validateAuthBeforeWrite('media', updatedDoc);
      await setDoc(doc(db, 'media', id), updatedDoc);
      setMediaItems(prev => prev.map(m => m.id === id ? updatedDoc : m));
      triggerFeedback('Media asset successfully replaced!');
    } catch (err) {
      console.error(err);
      triggerFeedback('Failed to replace media asset.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const deleteMediaItem = async (id: string) => {
    if (confirm('Delete this image from Media Library?')) {
      try {
        validateAuthBeforeWrite('media', { id });
        await deleteDoc(doc(db, 'media', id));
        setMediaItems(prev => prev.filter(m => m.id !== id));
        triggerFeedback('Image removed.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const copyMediaUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    triggerFeedback('Direct Image URL copied to Clipboard!');
  };

  const openMediaSelector = (target: 'product' | 'category' | 'blog') => {
    setMediaSelectorTarget(target);
    setIsMediaSelectorOpen(true);
    setMediaSelectorSearch('');
    setMediaSelectorCategoryFilter('All');
  };

  const handleSelectMediaForForm = (url: string) => {
    if (mediaSelectorTarget === 'product') {
      setProductForm(prev => ({ ...prev, image: url }));
    } else if (mediaSelectorTarget === 'category') {
      setCategoryForm(prev => ({ ...prev, image: url }));
    } else if (mediaSelectorTarget === 'blog') {
      setBlogForm(prev => ({ ...prev, image: url }));
    }
    setIsMediaSelectorOpen(false);
    setIsMediaSelectorOpen(false);
    setMediaSelectorTarget(null);
    triggerFeedback('Image assigned from your Media Library!');
  };

  // --- SAVE PRODUCT ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.category) {
      alert('Product title and category are required.');
      return;
    }

    const pId = productForm.id || `prod-${Date.now()}`;
    const tagsArray = productTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const finalProduct: Product = {
      id: pId,
      title: productForm.title,
      category: productForm.category,
      subcategory: productForm.subcategory || 'Uncategorized',
      description: productForm.description || '',
      review: productForm.review || '',
      rating: Number(productForm.rating) || 4.5,
      image: productForm.image || PRESET_IMAGES[0].url,
      affiliateLink: productForm.affiliateLink || 'https://www.amazon.com',
      featured: !!productForm.featured,
      trending: !!productForm.trending,
      tags: tagsArray
    };

    try {
      setFirestoreError(null);
      validateAuthBeforeWrite('products', finalProduct);
      await firebaseService.saveProduct(finalProduct);
      if (productForm.id) {
        setProducts(prev => prev.map(p => p.id === productForm.id ? finalProduct : p));
        triggerFeedback(`Successfully modified product: "${finalProduct.title}"`);
      } else {
        setProducts(prev => [finalProduct, ...prev]);
        triggerFeedback(`Successfully registered new find: "${finalProduct.title}"`);
      }

      // Reset
      setIsEditingProduct(false);
      setProductForm({
        id: '', title: '', category: categories[0]?.id || 'Books', subcategory: '', description: '', 
        review: '', rating: 4.5, image: '', affiliateLink: '', featured: false, trending: false, tags: []
      });
      setProductTagsInput('');
    } catch (e: any) {
      console.error('[AdminDashboard] Save Product Failure Context:');
      console.error(e);
      
      let parsedError = {
        code: 'unknown-code',
        message: e instanceof Error ? e.message : String(e),
        collection: 'products',
        documentData: finalProduct
      };

      try {
        const parsed = JSON.parse(e.message || String(e));
        if (parsed && typeof parsed === 'object' && 'error' in parsed) {
          parsedError = {
            code: parsed.errorCode || 'api-error',
            message: parsed.errorMessage || parsed.error,
            collection: parsed.path ? parsed.path.split('/')[0] : 'products',
            documentData: parsed.documentData || finalProduct
          };
        }
      } catch (_) {
        if (e && typeof e === 'object') {
          parsedError.code = e.code || 'api-error';
          parsedError.message = e.message || String(e);
        }
      }

      setFirestoreError(parsedError);
      
      // Print detailed errors in browser console
      console.error('--- Firestore Diagnostic Audit Details ---');
      console.error('Error Code:', parsedError.code);
      console.error('Error Message:', parsedError.message);
      console.error('Target Collection:', parsedError.collection);
      console.error('Data being saved:', JSON.stringify(parsedError.documentData, null, 2));

      // Alert with exact code and message instead of generic alert
      alert(`Firestore Error Code: [ ${parsedError.code} ]\nFirestore Error Message: ${parsedError.message}\nCollection Name: ${parsedError.collection}`);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setProductForm(prod);
    setProductTagsInput(prod.tags?.join(', ') || '');
    setIsEditingProduct(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete "${name}"?`)) {
      try {
        validateAuthBeforeWrite('products', { id, name });
        await firebaseService.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        triggerFeedback(`Deleted product: "${name}"`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- SAVE CATEGORY ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.description) {
      alert('Name and Description are required!');
      return;
    }

    const cId = categoryForm.id || getSlug(categoryForm.name);
    const finalCategory: Category = {
      id: cId,
      name: categoryForm.name,
      description: categoryForm.description,
      image: categoryForm.image || PRESET_IMAGES[2].url,
      icon: categoryForm.icon || 'Sparkles'
    };

    try {
      setFirestoreError(null);
      validateAuthBeforeWrite('categories', finalCategory);
      await firebaseService.saveCategory(finalCategory);
      if (categoryForm.id) {
        setCategories(prev => prev.map(c => c.id === categoryForm.id ? finalCategory : c));
        triggerFeedback(`Updated Category details: "${finalCategory.name}"`);
      } else {
        setCategories(prev => [...prev, finalCategory]);
        triggerFeedback(`Added standard Category: "${finalCategory.name}"`);
      }

      setIsEditingCategory(false);
      setCategoryForm({ id: '', name: '', description: '', image: '', icon: 'Sparkles' });
    } catch (error: any) {
      console.error(error);
      let parsedError = {
        code: 'unknown-code',
        message: error instanceof Error ? error.message : String(error),
        collection: 'categories',
        documentData: finalCategory
      };
      try {
        const parsed = JSON.parse(error.message || String(error));
        if (parsed && typeof parsed === 'object' && 'error' in parsed) {
          parsedError = {
            code: parsed.errorCode || 'api-error',
            message: parsed.errorMessage || parsed.error,
            collection: parsed.path ? parsed.path.split('/')[0] : 'categories',
            documentData: parsed.documentData || finalCategory
          };
        }
      } catch (_) {
        if (error && typeof error === 'object') {
          parsedError.code = error.code || 'api-error';
          parsedError.message = error.message || String(error);
        }
      }
      setFirestoreError(parsedError);
      alert(`Firestore Error Code: [ ${parsedError.code} ]\nFirestore Error Message: ${parsedError.message}\nCollection Name: ${parsedError.collection}`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Remove custom Category "${name}"? Note that this won't delete products.`)) {
      try {
        validateAuthBeforeWrite('categories', { id, name });
        await firebaseService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        triggerFeedback(`Deleted category: "${name}"`);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // --- SAVE SUBCATEGORY ---
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcategoryForm.name || !subcategoryForm.categoryId) {
      alert('Select parent category and type subcategory name!');
      return;
    }

    const subId = subcategoryForm.id || `sub-${getSlug(subcategoryForm.name)}-${Date.now()}`;
    const finalSub: Subcategory = {
      id: subId,
      categoryId: subcategoryForm.categoryId,
      name: subcategoryForm.name
    };

    try {
      setFirestoreError(null);
      validateAuthBeforeWrite('subcategories', finalSub);
      await firebaseService.saveSubcategory(finalSub);
      if (subcategoryForm.id) {
        setSubcategories(prev => prev.map(s => s.id === subcategoryForm.id ? finalSub : s));
        triggerFeedback(`Updated subcategory values: "${finalSub.name}"`);
      } else {
        setSubcategories(prev => [...prev, finalSub]);
        triggerFeedback(`Registered Subcategory: "${finalSub.name}"`);
      }

      setIsEditingSubcategory(false);
      setSubcategoryForm({ id: '', categoryId: categories[0]?.id || '', name: '' });
    } catch (error: any) {
      console.error(error);
      let parsedError = {
        code: 'unknown-code',
        message: error instanceof Error ? error.message : String(error),
        collection: 'subcategories',
        documentData: finalSub
      };
      try {
        const parsed = JSON.parse(error.message || String(error));
        if (parsed && typeof parsed === 'object' && 'error' in parsed) {
          parsedError = {
            code: parsed.errorCode || 'api-error',
            message: parsed.errorMessage || parsed.error,
            collection: parsed.path ? parsed.path.split('/')[0] : 'subcategories',
            documentData: parsed.documentData || finalSub
          };
        }
      } catch (_) {
        if (error && typeof error === 'object') {
          parsedError.code = error.code || 'api-error';
          parsedError.message = error.message || String(error);
        }
      }
      setFirestoreError(parsedError);
      alert(`Firestore Error Code: [ ${parsedError.code} ]\nFirestore Error Message: ${parsedError.message}\nCollection Name: ${parsedError.collection}`);
    }
  };

  const handleDeleteSubcategory = async (id: string, name: string) => {
    if (confirm(`Delete subcategory "${name}"?`)) {
      try {
        validateAuthBeforeWrite('subcategories', { id, name });
        await firebaseService.deleteSubcategory(id);
        setSubcategories(prev => prev.filter(s => s.id !== id));
        triggerFeedback(`Removed Subcategory: "${name}"`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- SAVE BLOG POST ---
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      alert('Content fields are required for blogs.');
      return;
    }

    const bId = blogForm.id || `blog-${Date.now()}`;
    const tagsArray = blogTagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const prodIdsArray = blogProdIdsInput.split(',').map(t => t.trim()).filter(Boolean);
    const imgsArray = blogImagesInput.split(',').map(t => t.trim()).filter(Boolean);
    const affLinksArray = blogAffiliatesInput.split(',').map(t => t.trim()).filter(Boolean);
    const pinImgsArray = blogPinterestInput.split(',').map(t => t.trim()).filter(Boolean);

    const finalBlog: BlogPost = {
      id: bId,
      title: blogForm.title,
      excerpt: blogForm.excerpt || (blogForm.content.slice(0, 140) + '...'),
      content: blogForm.content,
      image: blogForm.image || PRESET_IMAGES[1].url,
      category: blogForm.category || 'Books',
      date: blogForm.date || new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      readTime: blogForm.readTime || `${Math.max(3, Math.ceil(blogForm.content.split(' ').length / 150))} min read`,
      tags: tagsArray,
      productIds: prodIdsArray,
      images: imgsArray,
      affiliateLinks: affLinksArray,
      pinterestImages: pinImgsArray
    };

    try {
      setFirestoreError(null);
      validateAuthBeforeWrite('blogs', finalBlog);
      await firebaseService.saveBlog(finalBlog);
      if (blogForm.id) {
        setBlogs(prev => prev.map(b => b.id === blogForm.id ? finalBlog : b));
        triggerFeedback(`Saved blog amendments: "${blogForm.title}"`);
      } else {
        setBlogs(prev => [finalBlog, ...prev]);
        triggerFeedback(`New blog post published live!`);
      }

      setIsEditingBlog(false);
      setBlogForm({
        id: '', title: '', excerpt: '', content: '', image: '', category: categories[0]?.id || '',
        tags: [], productIds: [], images: [], affiliateLinks: [], pinterestImages: []
      });
      setBlogTagsInput('');
      setBlogProdIdsInput('');
      setBlogImagesInput('');
      setBlogAffiliatesInput('');
      setBlogPinterestInput('');
    } catch (err: any) {
      console.error(err);
      let parsedError = {
        code: 'unknown-code',
        message: err instanceof Error ? err.message : String(err),
        collection: 'blogs',
        documentData: finalBlog
      };
      try {
        const parsed = JSON.parse(err.message || String(err));
        if (parsed && typeof parsed === 'object' && 'error' in parsed) {
          parsedError = {
            code: parsed.errorCode || 'api-error',
            message: parsed.errorMessage || parsed.error,
            collection: parsed.path ? parsed.path.split('/')[0] : 'blogs',
            documentData: parsed.documentData || finalBlog
          };
        }
      } catch (_) {
        if (err && typeof err === 'object') {
          parsedError.code = err.code || 'api-error';
          parsedError.message = err.message || String(err);
        }
      }
      setFirestoreError(parsedError);
      alert(`Firestore Error Code: [ ${parsedError.code} ]\nFirestore Error Message: ${parsedError.message}\nCollection Name: ${parsedError.collection}`);
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setBlogForm(blog);
    setBlogTagsInput(blog.tags?.join(', ') || '');
    setBlogProdIdsInput(blog.productIds?.join(', ') || '');
    setBlogImagesInput(blog.images?.join(', ') || '');
    setBlogAffiliatesInput(blog.affiliateLinks?.join(', ') || '');
    setBlogPinterestInput(blog.pinterestImages?.join(', ') || '');
    setIsEditingBlog(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (confirm(`Remove entire Blog Article "${title}"?`)) {
      try {
        validateAuthBeforeWrite('blogs', { id, title });
        await firebaseService.deleteBlog(id);
        setBlogs(prev => prev.filter(b => b.id !== id));
        triggerFeedback('Removed blog article and dynamic links.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerFeedback('Settings parameters synchronized successfully.');
  };

  const resetAllFields = () => {
    // Standard clear or default seed triggers on reload
    if (confirm('Verify: Trigger full database re-seeding? This refreshes all default models into your Firestore collections.')) {
      try {
        validateAuthBeforeWrite('seed_data', { action: 'reseed' });
        firebaseService.ensureSeedData().then(() => {
          window.location.reload();
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filtered Media Gallery search
  const filteredMedia = mediaItems.filter(item => 
    item.name?.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <section className="py-10 bg-stone-50 min-h-screen text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with workspace coordinates */}
        <div className="bg-cozy-burgundy text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between shadow-md mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 mb-4 sm:mb-0 text-center sm:text-left">
            <span className="bg-white/10 text-cozy-cream text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase border border-white/10 inline-block mb-1.5">
              👑 Authorized Administrative Session
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
              MoonStack CMS Area
            </h1>
            <p className="text-cozy-rose/80 text-xs max-w-xl">
              Fully loaded Cloud Storage image uploading with Firebase synchronization. Keep items updated, style lists, and build tags easily.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={resetAllFields}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Full Re-Seed Firestore</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white hover:bg-red-50 text-cozy-burgundy rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Logout Admin
            </button>
          </div>
        </div>

        {/* Action feedback banner alerts */}
        {feedback && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-2 text-xs sm:text-sm font-semibold shadow-xs mb-8 transition-all animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Global Firestore Error Diagnostic Panel */}
        {firestoreError && (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-3xl p-6 shadow-sm mb-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-red-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-xl bg-red-100 text-red-700 font-serif font-bold text-sm">⚠️</span>
                <h3 className="font-serif font-bold text-red-950 text-md">Firestore Database Diagnostic Center</h3>
              </div>
              <button 
                onClick={() => setFirestoreError(null)}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Clear / Dismiss Error
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-2xl border border-red-100/60 shadow-xs">
                <span className="text-[10px] text-red-500 font-bold block uppercase tracking-wider mb-0.5">Firebase Error Code (error.code)</span>
                <code className="text-xs font-mono font-bold text-red-950 break-all">{firestoreError.code}</code>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-red-100/60 shadow-xs md:col-span-2">
                <span className="text-[10px] text-red-500 font-bold block uppercase tracking-wider mb-0.5">Firebase Error Message (error.message)</span>
                <p className="text-xs font-semibold text-red-900 mt-0.5 leading-relaxed">{firestoreError.message}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-red-100/60 shadow-xs">
                <span className="text-[10px] text-red-500 font-bold block uppercase tracking-wider mb-0.5">Target Firestore Collection</span>
                <code className="text-xs font-mono font-bold text-stone-705 break-all">{firestoreError.collection}</code>
              </div>
            </div>
            
            {firestoreError.documentData && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-red-500 font-bold block uppercase tracking-wider">Document Data Payload Being Saved</span>
                <pre className="bg-stone-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-56 border border-stone-850 shadow-inner">
                  {JSON.stringify(firestoreError.documentData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Modern tabs panel mapping 7 areas */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200 pb-4">
          {[
            { id: 'dashboard', label: '📊 Dashboard', count: null },
            { id: 'products', label: '📦 Products', count: products.length },
            { id: 'categories', label: '🗂️ Categories', count: categories.length },
            { id: 'subcategories', label: '🔖 Subcategories', count: subcategories.length },
            { id: 'blogs', label: '📝 Blog Posts', count: blogs.length },
            { id: 'media', label: '🖼️ Media Library', count: mediaItems.length },
            { id: 'settings', label: '⚙️ Settings', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${activeTab === tab.id ? 'bg-cozy-burgundy text-white shadow-xs' : 'bg-white border border-stone-250/30 text-stone-700 hover:bg-cozy-beige/10'}`}
            >
              {tab.label} {tab.count !== null && <span className="ml-1 text-[10px] opacity-75 bg-stone-100 px-1.5 py-0.5 rounded-full font-mono">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* RENDER THE 7 TABS DESIGNS */}

        {/* 1. DASHBOARD OVERVIEW PANEL */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Live Database Connection Diagnostics & Verification */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-stone-150">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎛️</span>
                  <h3 className="font-serif font-bold text-stone-950 text-base">Live Database Connection Diagnostics</h3>
                </div>
                <div className="flex items-center space-x-1.5 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                  <span className={`w-2 h-2 rounded-full ${dbVerification.firestoreConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                    {dbVerification.firestoreConnected ? 'Verified Online' : 'Check Required'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/40 space-y-1">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">1. Firebase Initialization</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-stone-800">
                      {dbVerification.firebaseInitialized ? '🟢 Loaded Successfully' : '🔴 Initialization Error'}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono block leading-tight truncate">{db?.app?.options?.projectId || 'Not Found'}</span>
                </div>
                
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/40 space-y-1">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">2. Firestore Database State</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-stone-800">
                      {dbVerification.firestoreConnected ? '🟢 Connected / Responsive' : '🔴 Connection Refused'}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono block leading-tight truncate">
                    {dbVerification.error ? 'Refused Connection API' : 'Database Ready for I/O'}
                  </span>
                </div>

                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/40 space-y-1">
                  <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">3. Products Collection existence</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-stone-800">
                      {dbVerification.productsCollectionExists ? `🟢 Collection Verified` : '🔴 Query Access Denied'}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono block leading-tight">
                    col("products"): {dbVerification.productsCount} live records
                  </span>
                </div>
              </div>

              {dbVerification.error && (
                <div className="bg-red-50 border border-red-100 text-red-950 p-4 rounded-xl text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider text-red-700 block">Verification Details & Error Stack:</span>
                  <p className="font-mono">{dbVerification.error}</p>
                </div>
              )}

              {/* Security & Firebase Auth State (Passed to Firestore) */}
              <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-stone-200/60 space-y-3 mt-4">
                <span className="text-[10px] text-cozy-burgundy font-extrabold uppercase tracking-wider block">🔒 Firebase Authentication State & Firestore Security Claims</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-stone-200/40 shadow-xs">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block mb-1">request.auth</span>
                    <div className="space-y-1">
                      <code className="text-xs font-mono font-bold block text-stone-800">
                        {auth.currentUser ? '✓ Object Loaded' : '❌ null (Unauthenticated)'}
                      </code>
                      <span className="text-[9px] text-stone-400 block leading-tight">Passed to Firestore service context</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200/40 shadow-xs">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block mb-1">request.auth.uid</span>
                    <div className="space-y-1">
                      <code className="text-xs font-mono font-bold block text-stone-800 truncate" title={auth.currentUser?.uid || 'null'}>
                        {auth.currentUser?.uid || 'null'}
                      </code>
                      <span className="text-[9px] text-stone-400 block leading-tight">Unique identifier inside Firestore</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200/40 shadow-xs">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block mb-1">request.auth.token.email</span>
                    <div className="space-y-1">
                      <code className="text-xs font-mono font-bold block text-[#8B0E2D] truncate" title={auth.currentUser?.email || 'null'}>
                        {auth.currentUser?.email || 'null'}
                      </code>
                      <span className="text-[9px] text-stone-400 block leading-tight font-serif italic text-stone-500">Verified authentication email</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs text-stone-700 font-semibold flex items-center space-x-1.5">
                    <span>Admin Write Authorisation Status:</span>
                  </span>
                  {auth.currentUser?.email?.toLowerCase() === 'workly244@gmail.com' ? (
                    <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-250">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>workly244@gmail.com is fully authenticated & authorized to write</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 bg-red-50 text-red-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>Writes BLOCKED: Not authenticated as workly244@gmail.com</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2.5xl border border-stone-205/35">
                <p className="text-cozy-brown text-[10px] font-bold uppercase tracking-wider">Total Products</p>
                <h3 className="font-serif text-3xl font-extrabold mt-1 text-stone-900">{products.length}</h3>
                <div className="text-[11px] text-[#81807e] mt-1">Live active directory items</div>
              </div>
              <div className="bg-white p-6 rounded-2.5xl border border-stone-205/35">
                <p className="text-cozy-brown text-[10px] font-bold uppercase tracking-wider">Categories</p>
                <h3 className="font-serif text-3xl font-extrabold mt-1 text-stone-900">{categories.length}</h3>
                <div className="text-[11px] text-[#81807e] mt-1">Dynamic catalog folders</div>
              </div>
              <div className="bg-white p-6 rounded-2.5xl border border-stone-205/35">
                <p className="text-cozy-brown text-[10px] font-bold uppercase tracking-wider">Subcategories</p>
                <h3 className="font-serif text-3xl font-extrabold mt-1 text-stone-900">{subcategories.length}</h3>
                <div className="text-[11px] text-[#81807e] mt-1">Granular filter levels</div>
              </div>
              <div className="bg-white p-6 rounded-2.5xl border border-stone-205/35">
                <p className="text-cozy-brown text-[10px] font-bold uppercase tracking-wider">Blog Insights</p>
                <h3 className="font-serif text-3xl font-extrabold mt-1 text-stone-900">{blogs.length}</h3>
                <div className="text-[11px] text-[#81807e] mt-1">High fidelity roundups</div>
              </div>
            </div>

            {/* Quick overview of latest products and activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <h3 className="font-serif font-bold text-stone-950 text-base">Affiliate Engine Health</h3>
                  <BarChart2 className="w-5 h-5 text-cozy-burgundy" />
                </div>
                <div className="space-y-4 text-xs leading-relaxed text-stone-600">
                  <p>
                    All database components are registered under Firestore collections in project <strong className="font-mono">ai-studio-c12ddad5-80d2-451c-bc18-9f7351dc4d92</strong>.
                  </p>
                  <p>
                    All photos and uploaded assets are securely stored on remote regional server arrays at <strong className="font-mono">earnest-legend-pjwpf.firebasestorage.app</strong>.
                  </p>
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/50 flex items-start gap-3">
                    <span className="text-base text-stone-700">🔒</span>
                    <div>
                      <h4 className="font-semibold text-stone-850">Access Restrictions</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Authorization is restricted solely to verified user sessions of <strong>workly244@gmail.com</strong>. Other Google Identities are automatically blocked on the entry login gates.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-stone-950 text-base mb-4 pb-3 border-b border-stone-100">Media & Presets</h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    Instantly retrieve and assign images directly using the photo array. You can paste public URLs, upload from hard disks, or drag files straight into the form stages.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('media')}
                  className="w-full py-3 bg-cozy-beige/40 hover:bg-cozy-rose/25 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <ImageIcon className="w-4 h-4 text-cozy-burgundy" />
                  <span>Launch Media Manager Assets</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS DIRECTORY TAB */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <h2 className="font-serif text-lg font-bold text-stone-950 mb-6 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cozy-burgundy/10 text-cozy-burgundy inline-block">
                  <Settings className="w-4.5 h-4.5" />
                </span>
                <span>{isEditingProduct ? `Edit Curated Product details` : 'Add Curated Lifestyle Product'}</span>
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Product Name</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="e.g. Amber Touch Control Brass Lamp"
                      value={productForm.title || ''}
                      onChange={e => setProductForm(p => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Curation Rating (1.0 to 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="e.g. 4.8"
                      value={productForm.rating || ''}
                      onChange={e => setProductForm(p => ({ ...p, rating: parseFloat(e.target.value) || 4.5 }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Parent Category</label>
                    <select
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      value={productForm.category || ''}
                      onChange={e => {
                        const targetCat = e.target.value;
                        const matchedSubs = subcategories.filter(s => s.categoryId === targetCat);
                        setProductForm(p => ({ 
                          ...p, 
                          category: targetCat,
                          subcategory: matchedSubs[0]?.name || ''
                        }));
                      }}
                      required
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Subcategory Filter</label>
                    {filteredSubcategories.length > 0 ? (
                      <select
                        className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                        value={productForm.subcategory || ''}
                        onChange={e => setProductForm(p => ({ ...p, subcategory: e.target.value }))}
                      >
                        <option value="">-- Choose Subcategory --</option>
                        {filteredSubcategories.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold placeholder:font-normal"
                        placeholder="e.g. Thriller, Lighting, Accessories (Add in Subcategory tab)"
                        value={productForm.subcategory || ''}
                        onChange={e => setProductForm(p => ({ ...p, subcategory: e.target.value }))}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Search Keywords / Tags</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="cozy, warm, gold, leather"
                      value={productTagsInput}
                      onChange={e => setProductTagsInput(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Amazon Affiliate Link URL</label>
                    <input
                      type="url"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all"
                      placeholder="https://www.amazon.com/dp/..."
                      value={productForm.affiliateLink || ''}
                      onChange={e => setProductForm(p => ({ ...p, affiliateLink: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Image Selector & Upload directly */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-2">Product Image Upload</label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-stone-200 p-4 rounded-2xl bg-stone-50/30">
                      
                      {/* Drop block device upload */}
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 p-4 rounded-xl hover:bg-stone-50 transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={e => handleFormImageUpload(e, 'product')}
                          disabled={isUploadingFormImage}
                        />
                        <Upload className="w-8 h-8 text-stone-400 mb-2" />
                        <span className="text-xs font-bold text-stone-700 text-center">
                          {isUploadingFormImage ? 'Uploading Image to Cloud...' : 'Upload Image from Device'}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1">Supports JPG, PNG, WEBP</span>
                      </div>

                      {/* URL / Paste Stage fallback */}
                      <div className="lg:col-span-2 flex flex-col justify-between">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Or paste direct image URL</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
                            placeholder="https://images.unsplash.com/..."
                            value={productForm.image || ''}
                            onChange={e => setProductForm(p => ({ ...p, image: e.target.value }))}
                          />
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => openMediaSelector('product')}
                              className="w-full py-2 bg-cozy-burgundy/10 text-cozy-burgundy font-bold text-xs rounded-xl hover:bg-cozy-burgundy/20 border border-cozy-burgundy/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              📂 Choose From Media Library
                            </button>
                          </div>
                        </div>

                        {/* Preview panel */}
                        <div className="mt-3 flex items-center gap-3">
                          {productForm.image ? (
                            <>
                              <img
                                src={productForm.image}
                                alt="Form preview"
                                className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                              />
                              <div>
                                <span className="text-[11px] font-bold text-emerald-700 block">✓ Image Selected</span>
                                <button
                                  type="button"
                                  onClick={() => setProductForm(p => ({ ...p, image: '' }))}
                                  className="text-[10px] text-red-600 font-bold hover:underline"
                                >
                                  Delete/Clear Selection
                                </button>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-[#8e8d8a] italic">No image file assigned to product. Select preset choose or drop a file!</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Product Description Overview</label>
                    <textarea
                      rows={2}
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-sans"
                      placeholder="Write a clear description..."
                      value={productForm.description || ''}
                      onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Your Personal Review Notes</label>
                    <textarea
                      rows={2}
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-sans"
                      placeholder="Share your experience..."
                      value={productForm.review || ''}
                      onChange={e => setProductForm(p => ({ ...p, review: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-wrap gap-4 pt-1">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-cozy-burgundy rounded text-cozy-burgundy"
                        checked={!!productForm.featured}
                        onChange={e => setProductForm(p => ({ ...p, featured: e.target.checked }))}
                      />
                      <span className="text-xs font-bold text-stone-800 uppercase">Featured Highlight on Homepage</span>
                    </label>

                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-cozy-burgundy rounded text-cozy-burgundy"
                        checked={!!productForm.trending}
                        onChange={e => setProductForm(p => ({ ...p, trending: e.target.checked }))}
                      />
                      <span className="text-xs font-bold text-stone-800 uppercase">Trending This Week Selection</span>
                    </label>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  {isEditingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProduct(false);
                        setProductForm({
                          id: '', title: '', category: categories[0]?.id || '', subcategory: '', description: '', 
                          review: '', rating: 4.5, image: '', affiliateLink: '', featured: false, trending: false, tags: []
                        });
                        setProductTagsInput('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                    >
                      Discard Edits
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cozy-burgundy text-white font-bold rounded-xl text-xs flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isEditingProduct ? 'Save Product Changes' : 'Register Curated Product'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <h3 className="font-serif text-base font-bold text-stone-950 border-b border-stone-100 pb-3 mb-4">
                Catalog products database ({products.length} Items)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-widest font-semibold pb-2">
                      <th className="py-2 px-2">Curation details</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Subcategory</th>
                      <th className="py-2 px-2">Rating</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {products.map(item => {
                      const matchedCat = categories.find(c => c.id === item.category);
                      return (
                        <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt=""
                                className="w-8 h-8 object-cover rounded"
                              />
                              <div>
                                <span className="font-bold text-stone-900 block leading-tight">{item.title}</span>
                                <span className="text-[10px] font-mono text-stone-400 font-medium bg-stone-100 px-1 rounded block w-max mt-0.5">
                                  slug: {getSlug(item.title)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-stone-600 font-medium">
                            {matchedCat ? matchedCat.name : item.category}
                          </td>
                          <td className="py-3 px-2 text-stone-600 font-medium">
                            {item.subcategory}
                          </td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center space-x-1 text-amber-500 font-semibold font-mono">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{item.rating}</span>
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleEditProduct(item)}
                                className="p-1 px-2 text-cozy-burgundy bg-stone-100 hover:bg-cozy-rose/15 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(item.id, item.title)}
                                className="p-1 px-2 text-red-650 bg-red-50 hover:bg-red-500 hover:text-white rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CATEGORIES STRUCTURES */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <h2 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Grid className="w-4.5 h-4.5 text-cozy-burgundy" />
                <span>Create Curated Category</span>
              </h2>

              <form onSubmit={handleSaveCategory} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category Name</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="e.g. Books, Kitchen, Beauty"
                      value={categoryForm.name || ''}
                      onChange={e => setCategoryForm(c => ({ ...c, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Lucide Icon name</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="BookOpen, Sparkles, Home, Laptop, Heart"
                      value={categoryForm.icon || ''}
                      onChange={e => setCategoryForm(c => ({ ...c, icon: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category URL ID (slug)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-400 transition-all font-mono font-bold text-xs"
                      placeholder="books, kitchen, travel-essentials"
                      value={categoryForm.id || ''}
                      disabled={isEditingCategory}
                      onChange={e => setCategoryForm(c => ({ ...c, id: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description Tagline</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all"
                      placeholder="Description of the niche collection..."
                      value={categoryForm.description || ''}
                      onChange={e => setCategoryForm(c => ({ ...c, description: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Image input with upload capabilities */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-2">Category Cover Image</label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-stone-200 p-4 rounded-2xl bg-stone-50/30">
                      
                      {/* Upload block */}
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 p-4 rounded-xl hover:bg-stone-50 transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={e => handleFormImageUpload(e, 'category')}
                          disabled={isUploadingFormImage}
                        />
                        <Upload className="w-8 h-8 text-stone-400 mb-2" />
                        <span className="text-xs font-bold text-stone-700 text-center">
                          {isUploadingFormImage ? 'Uploading Image...' : 'Click to Upload from Device'}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1">JPG, PNG, WEBP allowed</span>
                      </div>

                      {/* Manual field */}
                      <div className="lg:col-span-2 flex flex-col justify-between">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Backup Image URL</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800"
                            placeholder="https://..."
                            value={categoryForm.image || ''}
                            onChange={e => setCategoryForm(c => ({ ...c, image: e.target.value }))}
                          />
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => openMediaSelector('category')}
                              className="w-full py-1.5 bg-cozy-burgundy/10 text-cozy-burgundy font-bold text-xs rounded-xl hover:bg-cozy-burgundy/20 border border-cozy-burgundy/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              📂 Choose From Media Library
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          {categoryForm.image && (
                            <img
                              src={categoryForm.image}
                              alt="Preview"
                              className="w-10 h-10 object-cover rounded border"
                            />
                          )}
                          <span className="text-[10px] text-stone-500 italic">This banner represents the background visual card of your category page.</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cozy-burgundy text-white font-bold rounded-xl text-xs"
                  >
                    {isEditingCategory ? 'Update Category Details' : 'Publish Dynamic Category'}
                  </button>
                </div>
              </form>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map(c => (
                <div key={c.id} className="bg-white rounded-3xl p-5 border border-stone-200/50 relative overflow-hidden flex flex-col justify-between h-48 shadow-xs">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-xs">
                    <img src={c.image} alt="" className="w-full h-full object-cover rounded-bl-full" />
                  </div>
                  <div>
                    <span className="text-xl bg-cozy-beige/30 p-2 rounded-xl inline-block mb-3 border border-cozy-rose/10">🏷️</span>
                    <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight">{c.name}</h3>
                    <p className="text-[#81807e] text-xs mt-1 line-clamp-2 pr-10">{c.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3.5 mt-4">
                    <span className="text-[10px] font-mono font-medium text-stone-400">path: /category/{c.id}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setCategoryForm(c); setIsEditingCategory(true); }}
                        className="p-1 px-2.5 text-xs text-cozy-burgundy border border-cozy-rose/20 rounded-lg hover:bg-cozy-beige/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="p-1 px-2.5 text-xs text-white bg-red-650 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SUBCATEGORIES MANAGEMENT TAB */}
        {activeTab === 'subcategories' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <h2 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-cozy-burgundy" />
                <span>Create Subcategory Filter Level</span>
              </h2>

              <form onSubmit={handleSaveSubcategory} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Parent Category linkage</label>
                    <select
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      value={subcategoryForm.categoryId || ''}
                      onChange={e => setSubcategoryForm(s => ({ ...s, categoryId: e.target.value }))}
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Subcategory Filter name</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="e.g. Romance, Shoes, Bags, Lighting, Gadgets"
                      value={subcategoryForm.name || ''}
                      onChange={e => setSubcategoryForm(s => ({ ...s, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cozy-burgundy text-white font-bold rounded-xl text-xs"
                  >
                    Add Subcategory
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50">
              <h3 className="font-serif text-base font-bold text-stone-950 border-b border-stone-100 pb-3 mb-4">
                Structured subcategories hierarchy ({subcategories.length} filters)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories.map(sub => {
                  const parentCat = categories.find(c => c.id === sub.categoryId);
                  return (
                    <div key={sub.id} className="p-4 border border-stone-200/40 rounded-2xl bg-stone-50/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-cozy-rose/10 text-cozy-burgundy border border-cozy-rose/20 px-2 py-0.5 rounded-full block w-max uppercase font-bold mb-1">
                          Ref: {parentCat ? parentCat.name : sub.categoryId}
                        </span>
                        <h4 className="font-serif font-bold text-[#2a2928] text-sm">{sub.name}</h4>
                        <span className="text-[9px] text-[#8e8d8a] font-mono">
                          path: /category/{sub.categoryId}/{getSlug(sub.name)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                        className="text-xs text-red-650 bg-red-50 hover:bg-red-500 hover:text-white p-1.5 px-2.5 rounded-lg font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. COZY BLOG ENTRIES */}
        {activeTab === 'blogs' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <h2 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-cozy-burgundy" />
                <span>Write Editorial Blog Post</span>
              </h2>

              <form onSubmit={handleSaveBlog} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Post Title</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="e.g. Masterclass on Cozying up your desk setup"
                      value={blogForm.title || ''}
                      onChange={e => setBlogForm(b => ({ ...b, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Primary Niche Cluster</label>
                    <select
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 font-semibold cursor-pointer"
                      value={blogForm.category || ''}
                      onChange={e => setBlogForm(b => ({ ...b, category: e.target.value }))}
                      required
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Article Brief / Excerpt</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all"
                      placeholder="Write a tiny 1-line hook description..."
                      value={blogForm.excerpt || ''}
                      onChange={e => setBlogForm(b => ({ ...b, excerpt: e.target.value }))}
                    />
                  </div>

                  {/* Multiple image upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-2">Main Blog Image File</label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-stone-200 p-4 rounded-2xl bg-stone-50/30">
                      
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 p-4 rounded-xl hover:bg-stone-50 relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={e => handleFormImageUpload(e, 'blog')}
                        />
                        <Upload className="w-8 h-8 text-stone-400 mb-2" />
                        <span className="text-xs font-bold text-stone-700">Upload Header Cover Image</span>
                      </div>

                      <div className="lg:col-span-2 flex flex-col justify-between">
                        <input
                          type="text"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs"
                          placeholder="Paste cover URL..."
                          value={blogForm.image || ''}
                          onChange={e => setBlogForm(b => ({ ...b, image: e.target.value }))}
                        />
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => openMediaSelector('blog')}
                            className="w-full py-1.5 bg-cozy-burgundy/10 text-cozy-burgundy font-bold text-xs rounded-xl hover:bg-cozy-burgundy/20 border border-cozy-burgundy/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            📂 Choose From Media Library
                          </button>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          {blogForm.image && <img src={blogForm.image} alt="" className="w-10 h-10 object-cover rounded" />}
                          <span className="text-[10px] text-stone-400 pr-5 leading-normal">Allows direct PNG and JPGS. Registered uploads align automatically in live layouts.</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Extended blog assets */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Related Tag Words (comma separated)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="Cozy Nook, Bookshelves, Cardamom tea"
                      value={blogTagsInput}
                      onChange={e => setBlogTagsInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Featured Product IDs (comma separated)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white text-stone-900 transition-all font-semibold"
                      placeholder="prod-1, prod-4, prod-6"
                      value={blogProdIdsInput}
                      onChange={e => setBlogProdIdsInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Additional Images Gallery (comma separated URLs)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                      placeholder="https://unsplash.com/..., https://..."
                      value={blogImagesInput}
                      onChange={e => setBlogImagesInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Pinterest Share Image URLs (comma separated)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                      placeholder="https://..."
                      value={blogPinterestInput}
                      onChange={e => setBlogPinterestInput(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Direct Affiliate Links (comma separated)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                      placeholder="https://www.amazon.com/dp/B123..., https://amazon.com/dp/B456..."
                      value={blogAffiliatesInput}
                      onChange={e => setBlogAffiliatesInput(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Blog Content markdown (supports HTML blocks)</label>
                    <textarea
                      rows={8}
                      className="w-full bg-stone-50/70 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:bg-white font-sans text-xs text-stone-900 leading-relaxed font-semibold transition-all"
                      placeholder="Write your editorial review article content in detail..."
                      value={blogForm.content || ''}
                      onChange={e => setBlogForm(b => ({ ...b, content: e.target.value }))}
                      required
                    />
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cozy-burgundy text-white font-bold rounded-xl text-xs"
                  >
                    Publish Post Article
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/50">
              <h3 className="font-serif text-base font-bold text-stone-950 border-b border-stone-100 pb-3 mb-4">
                Active blog directory listings ({blogs.length} articles)
              </h3>

              <div className="space-y-4">
                {blogs.map(post => (
                  <div key={post.id} className="flex gap-4 items-center p-4 border border-stone-100 bg-stone-50/20 hover:bg-stone-50/50 rounded-2xl transition-all">
                    <img src={post.image} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0 border" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] bg-cozy-burgundy/10 text-cozy-burgundy px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-[9px] text-[#8e8d8a] font-mono">{post.date}</span>
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm mt-1 truncate pr-16">{post.title}</h4>
                      <p className="text-stone-500 text-[10px] mt-0.5 line-clamp-1 leading-normal pr-16">{post.excerpt}</p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditBlog(post)}
                        className="text-xs font-bold px-3 py-1 bg-stone-100 hover:bg-cozy-rose/20 text-cozy-burgundy rounded-lg border border-stone-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(post.id, post.title)}
                        className="text-xs font-bold px-3 py-1 bg-red-55 hover:bg-red-550 hover:text-white text-red-600 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. MEDIA LIBRARY MANAGER */}
        {activeTab === 'media' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Real-time local preview BEFORE publishing */}
            {pendingMediaPreview ? (
              <div className="bg-[#fcfbf9] rounded-3xl p-6 sm:p-8 border-2 border-cozy-burgundy shadow-md space-y-6 animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">✨ Preview Media Asset Before Publishing</h3>
                    <p className="text-xs text-stone-500 font-medium">Configure file details and verify look before uploading to servers.</p>
                  </div>
                  <button
                    onClick={handleCancelPendingMedia}
                    className="p-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-xs"
                  >
                    Cancel / Discard
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Preview visual */}
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden relative shadow-inner shrink-0">
                    <img src={pendingMediaPreview} alt="Local pre-publish preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                      Local Feed Preview
                    </div>
                  </div>

                  {/* Right: metadata configuration fields */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Asset Document Name</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 outline-none text-xs text-stone-900 font-medium"
                        placeholder="e.g. cozy_reading_corner.jpg"
                        value={pendingMediaName}
                        onChange={e => setPendingMediaName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Organize in Category</label>
                      <select
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 outline-none text-xs text-stone-900 font-medium"
                        value={pendingMediaCategory}
                        onChange={e => setPendingMediaCategory(e.target.value as any)}
                      >
                        <option value="Books">📚 Books</option>
                        <option value="Fashion">👗 Fashion</option>
                        <option value="Home Decor">🛋️ Home Decor</option>
                        <option value="Beauty">💄 Beauty</option>
                        <option value="Tech">💻 Tech</option>
                      </select>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handlePublishPendingMedia}
                        disabled={isUploadingMedia}
                        className="px-5 py-2.5 bg-cozy-burgundy hover:bg-cozy-brown text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isUploadingMedia ? 'Uploading & Registering...' : 'Publish Asset to Library'}</span>
                      </button>
                      
                      <button
                        onClick={handleCancelPendingMedia}
                        className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold rounded-xl text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-stone-100 pb-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-stone-950 text-base">Media Library Asset Space</h3>
                  <p className="text-xs text-stone-500 font-medium">Upload images from device, organize by category, search and copy URLs.</p>
                </div>

                {/* Upload Trigger (directly routes to preview first) */}
                <div className="mt-3 sm:mt-0 relative flex items-center justify-center p-3 bg-cozy-burgundy hover:bg-cozy-brown text-white font-bold rounded-xl text-xs gap-1 cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleSelectPendingMedia}
                  />
                </div>
              </div>

              {/* Filters Block: Categories + Search Query */}
              <div className="space-y-4 mb-6">
                {/* Categories Tabs Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  <span className="text-xs font-bold text-stone-500 mr-2 shrink-0">Filter Category:</span>
                  {(['All', 'Books', 'Fashion', 'Home Decor', 'Beauty', 'Tech', 'Uncategorized'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedMediaCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 ${
                        selectedMediaCategoryFilter === cat
                          ? 'bg-cozy-burgundy text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat === 'All' ? '🌐 All Assets' : cat}
                    </button>
                  ))}
                </div>

                {/* Search Term Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search file names in Library..."
                    className="w-full bg-stone-55 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white text-xs text-stone-800"
                    value={mediaSearch}
                    onChange={e => setMediaSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid assets */}
              {(() => {
                const items = mediaItems.filter(item => {
                  const matchesSearch = item.name?.toLowerCase().includes(mediaSearch.toLowerCase());
                  const matchesCategory = selectedMediaCategoryFilter === 'All' || 
                                          (item.category === selectedMediaCategoryFilter) ||
                                          (selectedMediaCategoryFilter === 'Uncategorized' && !item.category);
                  return matchesSearch && matchesCategory;
                });

                if (items.length === 0) {
                  return (
                    <div className="py-16 text-center space-y-2 border border-dashed border-stone-200 rounded-2xl max-w-sm mx-auto bg-stone-50/40">
                      <ImageIcon className="w-10 h-10 text-stone-400 mx-auto animate-pulse" />
                      <h4 className="font-serif font-bold text-stone-850 text-sm">No assets match criteria</h4>
                      <p className="text-[11px] text-stone-500 leading-normal px-8">No uploaded assets in category "{selectedMediaCategoryFilter}". Select device files to add them!</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(item => (
                      <div key={item.id} className="group bg-stone-50/50 rounded-2xl border border-stone-200 p-2.5 flex flex-col justify-between h-56 relative shadow-xs overflow-hidden hover:border-cozy-burgundy/30 transition-all">
                        <div className="w-full h-28 overflow-hidden rounded-xl bg-stone-200 border-b border-stone-100 relative">
                          <img src={item.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white ${
                              item.category === 'Books' ? 'bg-purple-600' :
                              item.category === 'Fashion' ? 'bg-amber-600' :
                              item.category === 'Home Decor' ? 'bg-emerald-600' :
                              item.category === 'Beauty' ? 'bg-pink-600' :
                              item.category === 'Tech' ? 'bg-teal-600' : 'bg-stone-500'
                            }`}>
                              {item.category || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="block text-[10px] font-bold text-stone-900 truncate leading-tight pr-1" title={item.name}>{item.name}</span>
                            <span className="block text-[8px] text-stone-400 font-mono mt-0.5">{item.id}</span>
                          </div>

                          {/* Quick trigger input for replacing file */}
                          <input
                            type="file"
                            accept="image/*"
                            id={`replace-input-${item.id}`}
                            className="hidden"
                            onChange={e => handleReplaceMediaImage(item.id, e)}
                          />

                          <button
                            type="button"
                            onClick={() => document.getElementById(`replace-input-${item.id}`)?.click()}
                            className="w-full text-center mt-2 bg-stone-100 group-hover:bg-cozy-burgundy/10 text-[9px] font-bold text-stone-600 group-hover:text-cozy-burgundy py-1 rounded-lg border border-stone-200/40 hover:border-cozy-burgundy/20 transition-all"
                            title="Replace this image file with another while preserving asset"
                          >
                            🔄 Replace Image
                          </button>
                        </div>

                        {/* Floating actions wrapper */}
                        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyMediaUrl(item.url)}
                            className="bg-white/90 p-2 text-stone-700 hover:text-cozy-burgundy rounded-full shadow hover:bg-white cursor-pointer transition-colors"
                            title="Copy Direct URL link to clipboard"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteMediaItem(item.id)}
                            className="bg-white/90 p-2 text-red-600 hover:text-red-700 rounded-full shadow hover:bg-white cursor-pointer transition-colors"
                            title="Delete image asset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

            </div>
          </div>
        )}

        {/* 7. SETTINGS CONTROLS */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-350">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50">
              <h3 className="font-serif font-bold text-stone-950 text-base mb-6 pb-2 border-b border-stone-100">
                General System Parameters
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Scrapbook App Name</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none"
                      value={siteName}
                      disabled
                      onChange={e => setSiteName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Administrative Role Access</label>
                    <input
                      type="text"
                      className="w-full bg-stone-200 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-500 font-mono font-bold"
                      value="workly244@gmail.com"
                      disabled
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-cozy-burgundy accent-cozy-burgundy focus:ring-0"
                        checked={allowGuestPins}
                        onChange={e => setAllowGuestPins(e.target.checked)}
                      />
                      <span className="text-xs font-bold text-stone-800 uppercase">Allow Guests to bookmark pins (LocalStorage cache)</span>
                    </label>
                    <p className="text-[11px] text-stone-500 leading-normal pl-6">When checked, guests browsing the platform may save items securely within their client-side browser space without requiring Google Authentication.</p>
                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t border-stone-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 border border-stone-850 hover:bg-stone-850 text-white rounded-xl text-xs font-bold"
                  >
                    Lock Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reuse Selector Modal */}
        {isMediaSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Select Asset from Media Library</h3>
                  <p className="text-xs text-stone-500 font-medium">Pick an existing image to reuse for your {mediaSelectorTarget} form.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsMediaSelectorOpen(false);
                    setMediaSelectorTarget(null);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Filter / Search inside Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search library file names..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 outline-none focus:bg-white text-xs text-stone-800"
                    value={mediaSelectorSearch}
                    onChange={e => setMediaSelectorSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                  {(['All', 'Books', 'Fashion', 'Home Decor', 'Beauty', 'Tech', 'Uncategorized'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMediaSelectorCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0 transition-all ${
                        mediaSelectorCategoryFilter === cat 
                          ? 'bg-cozy-burgundy text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Library Grid */}
              <div className="flex-1 overflow-y-auto min-h-[320px] border border-stone-150 rounded-2xl p-4 bg-stone-55/20">
                {(() => {
                  const items = mediaItems.filter(item => {
                    const matchesSearch = item.name?.toLowerCase().includes(mediaSelectorSearch.toLowerCase());
                    const matchesCategory = mediaSelectorCategoryFilter === 'All' || 
                                            (item.category === mediaSelectorCategoryFilter) ||
                                            (mediaSelectorCategoryFilter === 'Uncategorized' && !item.category);
                    return matchesSearch && matchesCategory;
                  });

                  if (items.length === 0) {
                    return (
                      <div className="py-20 text-center text-stone-400 space-y-2">
                        <ImageIcon className="w-10 h-10 mx-auto text-stone-300" />
                        <p className="text-xs font-semibold">No media assets match your filters</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {items.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => handleSelectMediaForForm(item.url)}
                          className="group bg-white rounded-xl border border-stone-200 hover:border-cozy-burgundy p-2 flex flex-col justify-between h-40 cursor-pointer transition-all shadow-xs hover:shadow-md"
                        >
                          <div className="w-full h-24 overflow-hidden rounded-lg bg-stone-100 relative">
                            <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute top-1.5 left-1.5">
                              <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded-full text-white ${
                                item.category === 'Books' ? 'bg-purple-600' :
                                item.category === 'Fashion' ? 'bg-amber-600' :
                                item.category === 'Home Decor' ? 'bg-emerald-600' :
                                item.category === 'Beauty' ? 'bg-pink-600' :
                                item.category === 'Tech' ? 'bg-teal-600' : 'bg-stone-500'
                              }`}>
                                {item.category || 'Uncategorized'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 min-w-0">
                            <span className="block text-[10px] font-bold text-stone-800 truncate leading-tight">{item.name}</span>
                            <span className="block text-[8px] text-stone-400 font-mono mt-0.5">{item.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-[11px] text-stone-400 font-medium">Click any image card to select and attach it instantly to your form</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMediaSelectorOpen(false);
                    setMediaSelectorTarget(null);
                  }}
                  className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-850"
                >
                  Cancel Selection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
