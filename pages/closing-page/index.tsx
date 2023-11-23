import React from 'react';
import Footer from '../../src/components/footer/footer';
import style from './closingPage.module.css';

const ClosingPage: React.FC = () => {
  return (
    <div className={style.container}>
      <div className={style.centerDiv}>
        <img className="icon" src="/icons/Icon-person-white.svg" alt="" />
        <p>
          Thank you for using this app.
          <br />
          See you again.
        </p>
      </div>
      <div className={style.footer}>
        <Footer status={false} />
      </div>

    </div>
  );
};

export default ClosingPage;
