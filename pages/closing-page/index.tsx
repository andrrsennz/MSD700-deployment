import React from 'react';
import Footer from '@/components/footer/footer';
import style from './closingPage.module.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const ClosingPage: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const goToSigninPage = (): void => {
    router.push("/");
  }


  return (
    <>
      <Head>
        <title>Closing Page</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={style.container}>
        <div className={style.centerDiv}>
          <div className={style.text}>
            <img className="icon" src="/icons/Icon-person-white.svg" alt="" />
            <p>
              Thank you for using this apps.
              <br />
              See you again.
            </p>
          </div>
          <div className={style.loginButton} onClick={goToSigninPage}>
            <img src="/icons/Login.svg" alt="" />
            <p className={style.mobile}>LOG IN</p>
            <p className={style.desktop}>Go to LOGIN page</p>
          </div>
        </div>

        <div className={style.footer}>
          <Footer status={false} />
        </div>

      </div>
    </>
  );
};


export default ClosingPage;
