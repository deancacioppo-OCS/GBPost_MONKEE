import type { SocialAccount, Post } from '../types';

/**
 * Mocks fetching social accounts from the HighLevel API for a given location.
 * In a real application, this would be a network request to your backend,
 * which would then securely call the HighLevel API.
 * @param locationId The HighLevel Location ID.
 * @returns A promise that resolves to an array of social accounts.
 */
export function fetchSocialAccounts(locationId: string): Promise<SocialAccount[]> {
  console.log(`Fetching accounts for Location ID: ${locationId}`);

  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      if (locationId.toLowerCase().includes('fail')) {
          reject(new Error('Invalid Location ID. Could not fetch accounts.'));
          return;
      }
      // Mocked data representing a typical response
      const mockAccounts: SocialAccount[] = [
        { id: 'gbp-12345', name: 'Example Plumbing (Main St)', provider: 'google_my_business' },
        { id: 'fb-67890', name: 'Example Plumbing Co', provider: 'facebook' },
        { id: 'gbp-54321', name: 'Example Electrical (Side St)', provider: 'google_my_business' },
        { id: 'ig-11223', name: 'ExamplePlumbing', provider: 'instagram' },
      ];
      resolve(mockAccounts);
    }, 1500);
  });
}

/**
 * Mocks scheduling a post via the HighLevel Social Planner API.
 * In a real application, this would be a network request to your backend.
 * @param locationId The HighLevel Location ID.
 * @param accountId The specific social account ID to post to.
 * @param post The post object containing all details.
 * @returns A promise that resolves with the result of the API call.
 */
export function schedulePost(
    locationId: string,
    accountId: string,
    post: Post
): Promise<{ success: boolean; message: string; }> {
    console.log(`Scheduling post for location '${locationId}' and account '${accountId}':`, post.title);

    return new Promise((resolve, reject) => {
        // Simulate network delay (e.g., 0.5 to 1.5 seconds)
        const delay = 500 + Math.random() * 1000;
        setTimeout(() => {
            // Simulate a failure case for demonstration purposes
            if (post.body && post.body.toLowerCase().includes('fail')) {
                resolve({ success: false, message: 'Post content flagged by policy.' });
                return;
            }
            // Simulate a random network error
            if (Math.random() < 0.1) { // 10% chance of failure
                resolve({ success: false, message: 'API connection timed out.' });
                return;
            }

            resolve({ success: true, message: 'Post scheduled successfully.' });
        }, delay);
    });
}
