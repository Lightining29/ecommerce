import './CategoryCard.css';

export default function CategoryCard({ category }) {
  return (
    <a href="#bestsellers" className="category-card">
      <div className="category-image-wrap">
        <img
          src={category.imageUrl || category.image}
          alt={category.name}
          loading="lazy"
        />
        <div className="category-overlay" />
      </div>
      <div className="category-info">
        <h3>{category.name}</h3>
        <span>{category.productCount} Products</span>
      </div>
    </a>
  );
}
