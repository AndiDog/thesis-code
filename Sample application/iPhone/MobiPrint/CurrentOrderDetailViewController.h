#import "OrderDetailViewController.h"

@interface CurrentOrderDetailViewController : OrderDetailViewController

@property (nonatomic, strong) IBOutlet UIBarButtonItem *submitOrderButton;

- (void)ordersChangedWithCurrentOrder:(NSDictionary*)currentOrder;

- (void)uploadingPicturesChanged;

@end
