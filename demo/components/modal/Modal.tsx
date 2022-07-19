import styles from "./Modal.module.css";
import Button from "../../components/Button/Button";

interface Iprops {
  contentText: string;
  buttonText: string;
  isLoading: boolean;
  disableButton:boolean;
  onButtonClick: () => void;
}

export default function Modal(props: Iprops) {
  return (
    <div className={styles.modalWrapper}>
      <div className={styles.contentWrapper}>{props.contentText}</div>
      {props.isLoading && <div className={styles.loading}></div>}
      <div className={styles.buttonWrapper}>
        <Button
          text={props.buttonText}
          isActive={!props.disableButton}
          onClick={props.onButtonClick}
        />
      </div>
    </div>
  );
}
