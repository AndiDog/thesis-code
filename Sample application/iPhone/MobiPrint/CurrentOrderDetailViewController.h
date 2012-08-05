#import "OrderDetailViewController.h"

@interface CurrentOrderDetailViewController : OrderDetailViewController

- (void)ordersChanged:(NSManagedObject*)currentOrder;

- (void)uploadingPicturesChanged;

@end
