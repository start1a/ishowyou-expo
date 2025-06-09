export interface Member {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  members: Member[];
}

const API_BASE_URL = 'https://example.com/api';

export async function fetchRooms(): Promise<Room[]> {
  const response = await fetch(`${API_BASE_URL}/rooms`);
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return response.json();
}

export async function createRoom(name: string): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!response.ok) {
    throw new Error('Failed to create room');
  }
  return response.json();
}

export async function fetchMembers(roomId: string): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/members`);
  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }
  return response.json();
}

export async function addMember(roomId: string, member: Member): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member)
  });
  if (!response.ok) {
    throw new Error('Failed to add member');
  }
  return response.json();
}
