export default function Banner() {
  return (
    <section>
      <div className="container-fluid">
        <div className="row max-height justify-content-center align-items-center">
          <div className="col-10 mx-auto banner text-center text-white banner-animate-content">
            <h1 className="text-capitalize">
              welcome to <strong className="banner-title">CritiComida</strong>
            </h1>
            <a href="#reviews" className="btn banner-link text-uppercase">explore</a>
          </div>
        </div>
      </div>
    </section>
  );
} 