import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore'
import type { 
  User, 
  Request, 
  Bid, 
  Chat, 
  ChatMessage, 
  Notification, 
  Company,
  WarehouseRequest,
  WarehouseQuote
} from '~/lib/types'

export class FirestoreService {
  private db: Firestore

  constructor(db: Firestore) {
    this.db = db
  }

  // Helper method to convert Firestore timestamps to Date objects
  private convertTimestamps(data: DocumentData): any {
    const converted = { ...data }
    for (const key in converted) {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate()
      } else if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = this.convertTimestamps(converted[key])
      }
    }
    return converted
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId))
      if (userDoc.exists()) {
        const userData = this.convertTimestamps(userDoc.data())
        return { id: userDoc.id, ...userData } as User
      }
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(this.db, 'users'), {
        ...userData,
        createdAt: now,
        updatedAt: now
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId)
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Request operations
  async getRequest(requestId: string): Promise<Request | null> {
    try {
      const requestDoc = await getDoc(doc(this.db, 'requests', requestId))
      if (requestDoc.exists()) {
        const requestData = this.convertTimestamps(requestDoc.data())
        return { id: requestDoc.id, ...requestData } as Request
      }
      return null
    } catch (error) {
      console.error('Error getting request:', error)
      throw error
    }
  }

  async getRequests(constraints: QueryConstraint[] = []): Promise<Request[]> {
    try {
      const q = query(collection(this.db, 'requests'), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Request
      })
    } catch (error) {
      console.error('Error getting requests:', error)
      throw error
    }
  }


  async getRequestsByCustomer(customerId: string): Promise<Request[]> {
    try {
      return await this.getRequests([
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      ])
    } catch (error) {
      console.error('Error getting requests by customer:', error)
      throw error
    }
  }

  async deleteRequest(requestId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'requests', requestId))
    } catch (error) {
      console.error('Error deleting request:', error)
      throw error
    }
  }

  async createRequest(requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(this.db, 'requests'), {
        ...requestData,
        createdAt: now,
        updatedAt: now
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating request:', error)
      throw error
    }
  }

  async updateRequest(requestId: string, requestData: Partial<Request>): Promise<void> {
    try {
      const requestRef = doc(this.db, 'requests', requestId)
      await updateDoc(requestRef, {
        ...requestData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating request:', error)
      throw error
    }
  }

  // Bid operations
  async getBid(bidId: string): Promise<Bid | null> {
    try {
      const bidDoc = await getDoc(doc(this.db, 'bids', bidId))
      if (bidDoc.exists()) {
        const bidData = this.convertTimestamps(bidDoc.data())
        return { id: bidDoc.id, ...bidData } as Bid
      }
      return null
    } catch (error) {
      console.error('Error getting bid:', error)
      throw error
    }
  }

  async getBids(constraints: QueryConstraint[] = []): Promise<Bid[]> {
    try {
      const q = query(collection(this.db, 'bids'), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Bid
      })
    } catch (error) {
      console.error('Error getting bids:', error)
      throw error
    }
  }

  async getBidsByRequest(requestId: string): Promise<Bid[]> {
    try {
      return await this.getBids([
        where('requestId', '==', requestId),
        orderBy('createdAt', 'desc')
      ])
    } catch (error) {
      console.error('Error getting bids by request:', error)
      throw error
    }
  }

  async getBidsByPartner(partnerId: string): Promise<Bid[]> {
    try {
      return await this.getBids([
        where('partnerId', '==', partnerId),
        orderBy('createdAt', 'desc')
      ])
    } catch (error) {
      console.error('Error getting bids by partner:', error)
      throw error
    }
  }

  async createBid(bidData: Omit<Bid, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(this.db, 'bids'), {
        ...bidData,
        createdAt: now,
        updatedAt: now
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating bid:', error)
      throw error
    }
  }

  async updateBid(bidId: string, bidData: Partial<Bid>): Promise<void> {
    try {
      const bidRef = doc(this.db, 'bids', bidId)
      await updateDoc(bidRef, {
        ...bidData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating bid:', error)
      throw error
    }
  }


  // Notification operations
  async getNotifications(userId: string, constraints: QueryConstraint[] = []): Promise<Notification[]> {
    try {
      const q = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        ...constraints
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Notification
      })
    } catch (error) {
      console.error('Error getting notifications:', error)
      throw error
    }
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(this.db, 'notifications'), {
        ...notificationData,
        createdAt: now
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId)
      await updateDoc(notificationRef, { read: true })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Company operations
  async getCompany(companyId: string): Promise<Company | null> {
    try {
      const companyDoc = await getDoc(doc(this.db, 'companies', companyId))
      if (companyDoc.exists()) {
        const companyData = this.convertTimestamps(companyDoc.data())
        return { id: companyDoc.id, ...companyData } as Company
      }
      return null
    } catch (error) {
      console.error('Error getting company:', error)
      throw error
    }
  }

  async getCompanies(constraints: QueryConstraint[] = []): Promise<Company[]> {
    try {
      const q = query(collection(this.db, 'companies'), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Company
      })
    } catch (error) {
      console.error('Error getting companies:', error)
      throw error
    }
  }

  async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(this.db, 'companies'), {
        ...companyData,
        createdAt: now,
        updatedAt: now
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }

  async updateCompany(companyId: string, companyData: Partial<Company>): Promise<void> {
    try {
      const companyRef = doc(this.db, 'companies', companyId)
      await updateDoc(companyRef, {
        ...companyData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  }

  // Warehouse Request operations (창고 견적 신청)
  async createWarehouseRequest(requestData: Omit<WarehouseRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('FirestoreService: 견적 신청 데이터 저장 중:', requestData)
      const now = new Date()
      const dataToSave = {
        ...requestData,
        createdAt: now,
        updatedAt: now
      }
      console.log('FirestoreService: 저장할 데이터:', dataToSave)
      
      const docRef = await addDoc(collection(this.db, 'warehouseRequests'), dataToSave)
      console.log('FirestoreService: 견적 신청 저장 완료, 문서 ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error creating warehouse request:', error)
      throw error
    }
  }

  async getWarehouseRequest(requestId: string): Promise<WarehouseRequest | null> {
    try {
      const requestDoc = await getDoc(doc(this.db, 'warehouseRequests', requestId))
      if (requestDoc.exists()) {
        const requestData = this.convertTimestamps(requestDoc.data())
        return { id: requestDoc.id, ...requestData } as WarehouseRequest
      }
      return null
    } catch (error) {
      console.error('Error getting warehouse request:', error)
      throw error
    }
  }

  async getWarehouseRequests(constraints: QueryConstraint[] = []): Promise<WarehouseRequest[]> {
    try {
      const q = query(collection(this.db, 'warehouseRequests'), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as WarehouseRequest
      })
    } catch (error) {
      console.error('Error getting warehouse requests:', error)
      throw error
    }
  }

  async getWarehouseRequestsByCustomer(customerId: string): Promise<WarehouseRequest[]> {
    try {
      console.log('FirestoreService: customerId로 견적 조회 중:', customerId)
      // 임시로 orderBy를 제거하여 인덱스 없이 쿼리 실행
      const requests = await this.getWarehouseRequests([
        where('customerId', '==', customerId)
      ])
      // 클라이언트에서 정렬
      requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      console.log('FirestoreService: 조회된 견적 수:', requests.length)
      console.log('FirestoreService: 조회된 견적 데이터:', requests)
      return requests
    } catch (error) {
      console.error('Error getting warehouse requests by customer:', error)
      throw error
    }
  }

  async getAvailableWarehouseRequests(): Promise<WarehouseRequest[]> {
    try {
      // 임시로 복합 쿼리를 단순화하여 인덱스 없이 실행
      const allRequests = await this.getWarehouseRequests([
        where('status', '==', 'pending')
      ])
      
      // 클라이언트에서 필터링 및 정렬
      const availableRequests = allRequests
        .filter(request => request.currentQuoteCount < 7)
        .sort((a, b) => {
          // 먼저 currentQuoteCount로 정렬, 같으면 createdAt으로 정렬
          if (a.currentQuoteCount !== b.currentQuoteCount) {
            return a.currentQuoteCount - b.currentQuoteCount
          }
          return b.createdAt.getTime() - a.createdAt.getTime()
        })
      
      return availableRequests
    } catch (error) {
      console.error('Error getting available warehouse requests:', error)
      throw error
    }
  }

  async updateWarehouseRequest(requestId: string, requestData: Partial<WarehouseRequest>): Promise<void> {
    try {
      const requestRef = doc(this.db, 'warehouseRequests', requestId)
      await updateDoc(requestRef, {
        ...requestData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating warehouse request:', error)
      throw error
    }
  }

  // Warehouse Quote operations (창고 견적 응답)
  async createWarehouseQuote(quoteData: Omit<WarehouseQuote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(this.db, 'warehouseQuotes'), {
        ...quoteData,
        createdAt: now,
        updatedAt: now
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating warehouse quote:', error)
      throw error
    }
  }

  async getWarehouseQuote(quoteId: string): Promise<WarehouseQuote | null> {
    try {
      const docRef = doc(this.db, 'warehouseQuotes', quoteId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as WarehouseQuote
      }
      return null
    } catch (error) {
      console.error('Error getting warehouse quote:', error)
      throw error
    }
  }

  async getWarehouseQuotes(constraints: QueryConstraint[] = []): Promise<WarehouseQuote[]> {
    try {
      const q = query(collection(this.db, 'warehouseQuotes'), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as WarehouseQuote
      })
    } catch (error) {
      console.error('Error getting warehouse quotes:', error)
      throw error
    }
  }

  async getWarehouseQuotesByRequest(requestId: string): Promise<WarehouseQuote[]> {
    try {
      // 임시로 orderBy를 제거하여 인덱스 없이 쿼리 실행
      const quotes = await this.getWarehouseQuotes([
        where('requestId', '==', requestId)
      ])
      // 클라이언트에서 정렬
      quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      return quotes
    } catch (error) {
      console.error('Error getting warehouse quotes by request:', error)
      throw error
    }
  }

  async getWarehouseQuotesByPartner(partnerId: string): Promise<WarehouseQuote[]> {
    try {
      // 임시로 orderBy를 제거하여 인덱스 없이 쿼리 실행
      const quotes = await this.getWarehouseQuotes([
        where('partnerId', '==', partnerId)
      ])
      // 클라이언트에서 정렬
      quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      return quotes
    } catch (error) {
      console.error('Error getting warehouse quotes by partner:', error)
      throw error
    }
  }

  async updateWarehouseQuote(quoteId: string, quoteData: Partial<WarehouseQuote>): Promise<void> {
    try {
      const quoteRef = doc(this.db, 'warehouseQuotes', quoteId)
      await updateDoc(quoteRef, {
        ...quoteData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating warehouse quote:', error)
      throw error
    }
  }

  // 견적 신청 시 현재 견적 수 증가
  async incrementQuoteCount(requestId: string): Promise<void> {
    try {
      const request = await this.getWarehouseRequest(requestId)
      if (request) {
        await this.updateWarehouseRequest(requestId, {
          currentQuoteCount: request.currentQuoteCount + 1
        })
      }
    } catch (error) {
      console.error('Error incrementing quote count:', error)
      throw error
    }
  }

  // Admin operations
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const q = query(collection(this.db, 'users'), where('role', '==', role))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as User
      })
    } catch (error) {
      console.error('Error getting users by role:', error)
      throw error
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(collection(this.db, 'users'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as User
      })
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  }

  async getAllRequests(): Promise<Request[]> {
    try {
      const q = query(collection(this.db, 'requests'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Request
      })
    } catch (error) {
      console.error('Error getting all requests:', error)
      throw error
    }
  }

  async getAllBids(): Promise<Bid[]> {
    try {
      const q = query(collection(this.db, 'bids'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Bid
      })
    } catch (error) {
      console.error('Error getting all bids:', error)
      throw error
    }
  }

  // Chat operations
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const chatRef = doc(this.db, 'chats', chatId)
      const chatSnap = await getDoc(chatRef)
      
      if (chatSnap.exists()) {
        const data = this.convertTimestamps(chatSnap.data())
        return { id: chatSnap.id, ...data } as Chat
      }
      return null
    } catch (error) {
      console.error('Error getting chat:', error)
      throw error
    }
  }

  async createChat(chatData: Omit<Chat, 'id'>): Promise<string> {
    try {
      const chatRef = collection(this.db, 'chats')
      const docRef = await addDoc(chatRef, {
        ...chatData,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  }

  async getChats(constraints: QueryConstraint[] = []): Promise<Chat[]> {
    try {
      const q = query(collection(this.db, 'chats'), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as Chat
      })
    } catch (error) {
      console.error('Error getting chats:', error)
      throw error
    }
  }

  async getChatByRequest(requestId: string): Promise<Chat | null> {
    try {
      const chats = await this.getChats([
        where('requestId', '==', requestId)
      ])
      return chats.length > 0 ? chats[0] : null
    } catch (error) {
      console.error('Error getting chat by request:', error)
      throw error
    }
  }

  // Message operations
  async getChatMessages(chatId: string, constraints: QueryConstraint[] = []): Promise<ChatMessage[]> {
    try {
      const messagesRef = collection(this.db, 'chats', chatId, 'messages')
      const q = query(messagesRef, ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data } as ChatMessage
      })
    } catch (error) {
      console.error('Error getting chat messages:', error)
      throw error
    }
  }

  async createChatMessage(chatId: string, messageData: Omit<ChatMessage, 'id'>): Promise<string> {
    try {
      const messagesRef = collection(this.db, 'chats', chatId, 'messages')
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating chat message:', error)
      throw error
    }
  }

  // Completed Quotes operations
  async createCompletedQuote(completedQuoteData: {
    requestId: string
    customerId: string
    partnerId: string
    quoteId: string
    customerName: string
    partnerName: string
    partnerCompany: string
    requestTitle: string
    pallets: number
    boxes: number
    storagePeriod: number
    storagePeriodUnit: string
    locationPreference?: string
    specialRequirements?: string
    inboundFee: number
    storageFee: number
    outboundFee: number
    wmsFee: number
    description?: string
    features?: string
    acceptedAt: Date
    status: 'active' | 'completed' | 'cancelled'
  }): Promise<string> {
    try {
      console.log('=== 완료된 견적 생성 시작 ===')
      console.log('완료된 견적 데이터:', completedQuoteData)
      
      const completedQuotesRef = collection(this.db, 'completedQuotes')
      const docRef = await addDoc(completedQuotesRef, {
        ...completedQuoteData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log('완료된 견적 생성 성공, ID:', docRef.id)
      console.log('=== 완료된 견적 생성 완료 ===')
      
      return docRef.id
    } catch (error) {
      console.error('Error creating completed quote:', error)
      throw error
    }
  }

  async getCompletedQuotes(constraints: QueryConstraint[] = []): Promise<any[]> {
    try {
      const completedQuotesRef = collection(this.db, 'completedQuotes')
      const q = query(completedQuotesRef, ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = this.convertTimestamps(doc.data())
        return { id: doc.id, ...data }
      })
    } catch (error) {
      console.error('Error getting completed quotes:', error)
      throw error
    }
  }

  async getCompletedQuotesByPartner(partnerId: string): Promise<any[]> {
    try {
      return await this.getCompletedQuotes([
        where('partnerId', '==', partnerId)
      ])
    } catch (error) {
      console.error('Error getting completed quotes by partner:', error)
      throw error
    }
  }

  async getCompletedQuotesByCustomer(customerId: string): Promise<any[]> {
    try {
      return await this.getCompletedQuotes([
        where('customerId', '==', customerId)
      ])
    } catch (error) {
      console.error('Error getting completed quotes by customer:', error)
      throw error
    }
  }

  async updateCompletedQuote(completedQuoteId: string, updateData: Partial<any>): Promise<void> {
    try {
      const completedQuoteRef = doc(this.db, 'completedQuotes', completedQuoteId)
      await updateDoc(completedQuoteRef, {
        ...updateData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating completed quote:', error)
      throw error
    }
  }

  // Helper methods for Firestore references
  getCollectionRef(path: string) {
    return collection(this.db, path)
  }

  getQuery(collectionRef: any, constraints: QueryConstraint[] = []) {
    return query(collectionRef, ...constraints)
  }
}
