import styles from "./styles.module.css"
import Head from "next/head"
import { GetServerSideProps } from "next"

import { getSession } from "next-auth/react"
import { Textarea } from "@/components/textarea"

import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { db } from "@/services/firebaseConnection"
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import Link from "next/link"

interface HomeProps {
    user: {
        email: string;
    }
}

interface TasksProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TasksProps[]>([]);

    useEffect(() => {
        async function loadTarefas() {
            const tarefasRef = collection(db, "tarefas");
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let lista = [] as TasksProps[];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        created: doc.data().created,
                        public: doc.data().public,
                        tarefa: doc.data().tarefa,
                        user: doc.data().user,
                    });
                });
                setTasks(lista);
            });
        }

        loadTarefas();
    }, [user?.email])

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked);
    }

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();

        if (input == "") return;

        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                public: publicTask,
                user: user?.email
            })

            setInput("");
            setPublicTask(false);

        } catch (err) {
            console.error(err);
        }
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tarefas", id);
        await deleteDoc(docRef);
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu Painel de Tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <Textarea
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                                placeholder="Digite Sua tarefa"
                            />
                            <div className={styles.checkboxArea}>
                                <input checked={publicTask} onChange={handleChangePublic} type="checkbox" className={styles.checkbox} />
                                <label>Deixar tarefa pública?</label>
                            </div>

                            <button className={styles.button} type="submit">
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas Tarefas</h1>

                    {tasks.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>Público</label>
                                    <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}
                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}
                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140" />
                                </button>
                            </div>
                        </article>
                    ))}

                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }
    return {
        props: {
            user: {
                email: session?.user?.email,
            }
        },
    }
}