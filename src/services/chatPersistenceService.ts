import { doc, setDoc, getDocs, collection, query, orderBy, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { EnhancedChatMessage } from '../types/agentReasoning';

/**
 * Deep sanitization to ensure no `undefined` values reach Firestore
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

export class ChatPersistenceService {
  /**
   * Save a single chat message (user or assistant) to the user's Firestore subcollection
   */
  static async saveChatMessage(userId: string, message: EnhancedChatMessage): Promise<void> {
    if (!userId) return;

    const path = `users/${userId}/chat_messages`;
    try {
      const docRef = doc(db, 'users', userId, 'chat_messages', message.id);
      const payload = sanitizeForFirestore({
        id: message.id,
        userId,
        sender: message.sender,
        text: message.text,
        timestamp: message.timestamp,
        createdAt: new Date().toISOString(),
        reasoningTrace: message.reasoningTrace || null,
        relatedOrder: message.relatedOrder || null,
        relatedProducts: message.relatedProducts || null,
        actionType: message.actionType || null,
        escalationTicket: message.escalationTicket || null,
        returnReceipt: message.returnReceipt || null,
        interactiveChips: message.interactiveChips || null,
        suggestedFollowUps: message.suggestedFollowUps || null
      });

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.warn(`Failed to persist chat message ${message.id} to Firestore:`, error);
      // Non-fatal if offline
    }
  }

  /**
   * Load the user's complete chat history from Firestore
   */
  static async loadChatHistory(userId: string): Promise<EnhancedChatMessage[]> {
    if (!userId) return [];

    const path = `users/${userId}/chat_messages`;
    try {
      const messagesRef = collection(db, 'users', userId, 'chat_messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);

      const messages: EnhancedChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        messages.push({
          id: data.id || docSnap.id,
          sender: data.sender || 'assistant',
          text: data.text || '',
          timestamp: data.timestamp || 'Recent',
          reasoningTrace: data.reasoningTrace || undefined,
          relatedOrder: data.relatedOrder || undefined,
          relatedProducts: data.relatedProducts || undefined,
          actionType: data.actionType || undefined,
          escalationTicket: data.escalationTicket || undefined,
          returnReceipt: data.returnReceipt || undefined,
          interactiveChips: data.interactiveChips || undefined,
          suggestedFollowUps: data.suggestedFollowUps || undefined
        });
      });


      return messages;
    } catch (error) {
      console.warn('Could not load chat history from Firestore:', error);
      return [];
    }
  }

  /**
   * Real-time subscription to user's chat messages
   */
  static subscribeToChat(
    userId: string,
    onMessages: (messages: EnhancedChatMessage[]) => void
  ): () => void {
    if (!userId) {
      return () => {};
    }

    const path = `users/${userId}/chat_messages`;
    const messagesRef = collection(db, 'users', userId, 'chat_messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: EnhancedChatMessage[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          messages.push({
            id: data.id || docSnap.id,
            sender: data.sender || 'assistant',
            text: data.text || '',
            timestamp: data.timestamp || 'Recent',
            reasoningTrace: data.reasoningTrace || undefined,
            relatedOrder: data.relatedOrder || undefined,
            relatedProducts: data.relatedProducts || undefined,
            actionType: data.actionType || undefined,
            escalationTicket: data.escalationTicket || undefined,
            returnReceipt: data.returnReceipt || undefined
          });
        });
        if (messages.length > 0) {
          onMessages(messages);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubscribe;
  }

  /**
   * Clear user's chat messages in Firestore
   */
  static async clearChatHistory(userId: string): Promise<void> {
    if (!userId) return;

    try {
      const messagesRef = collection(db, 'users', userId, 'chat_messages');
      const snapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);

      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/chat_messages`);
    }
  }
}
