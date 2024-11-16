import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import heroImg from "../../public/assets/hero.png";
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ comments, posts }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image className={styles.hero} alt="Logo Tarefas" src={heroImg} priority />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar<br />
          seus estudos e tarefas
        </h1>
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  
  const commentRef = collection(db, "comments");

  const postRef = collection(db, "tarefas");

  const postSnapshot = await getDocs(postRef);

  const commentSnapshot = await getDocs(commentRef);
  
  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60,
  }
}