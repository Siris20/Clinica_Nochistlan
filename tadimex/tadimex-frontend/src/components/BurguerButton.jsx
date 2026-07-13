import MenuIcon from '@mui/icons-material/Menu';


export const BurguerButton = ({ id }) => {
  return (
    <button
      className="btn btn-toolbar"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target={`#${id}`}
      aria-controls={id}
      style={{ position: "fixed", top: "10px", left: "10px", zIndex: 1500 }}
    >
      <MenuIcon />
    </button>
  );
};