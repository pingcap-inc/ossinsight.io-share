import type {GetServerSideProps, NextPage, PageConfig} from 'next';
import Head from 'next/head';
import Script from 'next/script';
import isbot from 'isbot';
import {pool} from '../lib/db';

interface Data {
  data: {
    title: string
    description: string
    keyword: string
    fullUrl: string
    fullImageUrl: string
  };
}

export const getServerSideProps: GetServerSideProps<Data> = async (context) => {
  const [list] = await pool.query('SELECT * FROM share_data WHERE id = ?', [context.query.shareId]);
  if (!(list instanceof Array) || list.length === 0) {
    return {
      redirect: {
        statusCode: 302,
        destination: 'https://ossinsight.io/',
      },
    };
  } else {
    const data: any = list[0];
    const {title, description, keyword, image_url, path} = data;

    const isBotRequest = isbot(context.req.headers['user-agent']);

    const fullUrl = `https://ossinsight.io${path}`;
    const fullImageUrl = process.env.CDN_URL + image_url;

    // Just redirect to destination if visitor is a person
    if (!isBotRequest) {
      return {
        redirect: {
          statusCode: 302,
          destination: fullUrl,
        },
      };
    }

    // render meta info page for bots
    return {
      props: {
        data: {title, description, keyword, fullUrl, fullImageUrl},
      },
    };
  }
};

const Home: NextPage<Data> = ({data: {title, description, keyword, fullImageUrl, fullUrl}}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keyword" content={keyword} />

        {/* OpenGraph https://ogp.me/ */}
        <meta name="og:title" content={title} />
        <meta name="og:type" content="website" />
        <meta name="og:url" content={fullUrl} />
        <meta name="og:image" content={fullImageUrl} />
        <meta name="og:site_name" content="OSSInsight" />

        {/* Twitter https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:site" content="OSSInsight" />
        <meta name="twitter:image" content={fullImageUrl} />

        <link rel="alternate" href={fullUrl} />
      </Head>

      <main style={{display: 'none'}}>
        <h1>{title}</h1>
        <p>{description}</p>
        <img alt="image" src={fullImageUrl} />
      </main>

      {/* Show if javascript not allowed */}
      <noscript>
        Click <a href={fullUrl} target="_self">here</a> to redirect...
      </noscript>

      {/* Do redirect in browser */}
      <Script id='redirect' strategy="afterInteractive">
        {`window.location.href='${fullUrl}'`}
      </Script>
    </>
  );
};

export default Home;

export const config: PageConfig = {
  unstable_includeFiles: [
    'sentry.client.config.js',
    'sentry.properties',
    '.env.*'
  ]
}
