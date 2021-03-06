#import <UIKit/UIKit.h>

@interface OrderDetailViewController : UIViewController

@property (nonatomic) bool isCurrentOrder;

@property (strong, nonatomic) NSDictionary *order;

@property (nonatomic, strong) IBOutlet UILabel *headingLabel;

@property (nonatomic, strong) IBOutlet UIScrollView *thumbnailsTable;

// protected
- (void)relayout;

@end
