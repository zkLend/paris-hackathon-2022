import styles from "./Button.module.css";

interface Iprops {
  text: string;
  onClick?: () => void;
  isActive: boolean;
}

export default function Button(Props: Iprops) {
  return (
    <div
      className={`${styles.button} ${
        Props.isActive ? "" : `${styles.disabled}`
      }`}
      onClick={Props.onClick}
    >
      {Props.text}
    </div>
  );
}
