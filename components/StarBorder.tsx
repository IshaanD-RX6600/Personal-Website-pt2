import "./StarBorder.css";

interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: any;
}

const StarBorder = ({
  as: Component = "div",
  className = "",
  color = "#ffffff",
  speed = "4s",
  thickness = 3,
  children,
  ...rest
}: StarBorderProps) => {
  return (
    <Component 
      className={`star-border-container ${className}`} 
      style={{
        '--border-color': color,
        animationDuration: speed,
        padding: `${thickness}px`,
        ...rest.style
      } as React.CSSProperties}
      {...rest}
    >
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
