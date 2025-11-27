
export class AdService {
    constructor() {
        this.ads = [
            { id: 'ad_hypercola', title: 'Hyper-Cola', reward: 50, duration: 3000 },
            { id: 'ad_cybervpn', title: 'Cyber-VPN', reward: 100, duration: 5000 },
            { id: 'ad_neurallink', title: 'Neural Link', reward: 200, duration: 8000 }
        ];
    }

    getAvailableAds() {
        // Simulate network delay
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.ads);
            }, 500);
        });
    }

    watchAd(adId) {
        return new Promise((resolve, reject) => {
            const ad = this.ads.find(a => a.id === adId);
            if (!ad) {
                reject('Ad not found');
                return;
            }

            console.log(`Watching ad: ${ad.title}...`);
            setTimeout(() => {
                resolve({ success: true, reward: ad.reward });
            }, ad.duration);
        });
    }
}
