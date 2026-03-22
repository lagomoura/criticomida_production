interface ProsConsProps {
  pros: string[];
  cons: string[];
}

export default function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="mb-3 md:mb-0">
        <div className="cc-card h-full">
          <div className="cc-card-body">
            <h5 className="card-title mb-3 text-success">Pros</h5>
            <ul className="list-unstyled mb-0">
              {pros.map((pro, i) => (
                <li key={i} className="mb-2">
                  <span className="mr-2">✅</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mb-3 md:mb-0">
        <div className="cc-card h-full">
          <div className="cc-card-body">
            <h5 className="card-title mb-3 text-danger">Contras</h5>
            <ul className="list-unstyled mb-0">
              {cons.length === 0 ? (
                <li>
                  <span className="mr-2">🎉</span>¡Nada relevante!
                </li>
              ) : (
                cons.map((con: string, i: number) => (
                  <li key={i} className="mb-2">
                    <span className="mr-2">⚠️</span>
                    {con}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
