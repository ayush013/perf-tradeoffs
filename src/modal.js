const Modal = ({ children, onClick }) => {
  return (
    <div
      className="z-50 fixed top-0 left-0 w-full h-full flex justify-center items-center"
      style={{ background: "rgba(255,255,255,0.1" }}
      onClick={onClick}
    >
      <div className="w-7/8 h-1/2 bg-black p-8 flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default Modal;
