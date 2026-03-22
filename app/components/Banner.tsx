export default function Banner() {
  return (
    <section>
      <div className="w-full px-0">
        <div
          className={
            'max-height flex flex-col items-center justify-center px-4 py-8'
          }
        >
          <div
            className={
              'banner banner-animate-content mx-auto w-full max-w-4xl ' +
              'text-center text-white'
            }
          >
            <h1 className="font-display capitalize">
              welcome to{' '}
              <strong className="banner-title">CritiComida</strong>
            </h1>
            <a
              href="#reviews"
              className="banner-link mt-6 inline-block uppercase"
            >
              explore
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
