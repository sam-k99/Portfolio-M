const Footer = () => {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-12 sm:pb-14">
      <footer className="flex flex-col items-center gap-4 border-t border-dashed border-border/80 pt-8 text-sm sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-base text-muted-foreground">Designed & Developed by</span>
          <span className="text-base font-light tracking-tight text-foreground">
            Sameer Khan
          </span>
        </p>
        
      </footer>
    </div>
  );
};

export default Footer;
