#import "OrderDetailViewController.h"

@interface CurrentOrderDetailViewController : OrderDetailViewController

@property (nonatomic, strong) IBOutlet UIBarButtonItem *submitOrderButton;

- (void)ordersChanged:(NSManagedObject*)currentOrder;

- (void)uploadingPicturesChanged;

@end
