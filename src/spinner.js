const Spinner = () => (
  <svg
    version="1.1"
    id="loader-1"
    x="0px"
    y="0px"
    width="40px"
    height="40px"
    viewBox="0 0 50 50"
    style={{ width: "100%", height: "100%" }}
  >
    <path
      fill="#fff"
      d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.6s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export default Spinner;
