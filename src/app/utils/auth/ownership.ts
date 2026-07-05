export function resourceBelongsToUser(userId: number, ownerUserId: number | null | undefined): boolean {
    return ownerUserId != null && ownerUserId === userId;
}
