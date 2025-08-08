import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { User } from "../type/User";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      } else {
        // ユーザーが存在しない場合は新規作成
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          const newUser: Omit<User, "id"> = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "匿名ユーザー",
            email: firebaseUser.email || "",
            role: "user", // デフォルトは一般ユーザー
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          await setDoc(doc(db, "users", uid), newUser);
          setUser({ id: uid, ...newUser });
        }
      }
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
      // エラーの場合も一時的にFirebase Authの情報を使用
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const tempUser: User = {
          id: uid,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "匿名ユーザー",
          email: firebaseUser.email || "",
          role: "user",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        setUser(tempUser);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        console.log("Auth state changed - user:", firebaseUser);
        console.log("displayName:", firebaseUser.displayName);
        
        // 既存のリスナーをクリーンアップ
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        
        // リアルタイムリスナーを設定
        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUser({ id: doc.id, ...doc.data() } as User);
          } else {
            // ドキュメントが存在しない場合は新規作成
            const newUser: Omit<User, "id"> = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || "匿名ユーザー",
              email: firebaseUser.email || "",
              role: "user",
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };
            setDoc(userDocRef, newUser);
            setUser({ id: firebaseUser.uid, ...newUser });
          }
          setLoading(false);
        }, (error) => {
          console.error("リアルタイムリスナーエラー:", error);
          // エラー時は通常のfetchUserを使用
          fetchUser(firebaseUser.uid);
        });
      } else {
        // 既存のリスナーをクリーンアップ
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  return { user, loading };
}; 